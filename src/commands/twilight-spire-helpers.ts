// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ShiftGrade = 'seamless-twilight' | 'smooth-transition' | 'proper-shift' | 'abrupt-change' | 'jarring-switch' | 'no-transition'
export type DuskGrade = 'eternal-spire' | 'twilight-tower' | 'proper-pillar' | 'crumbling-tower' | 'falling-stones' | 'no-endurance'
export type StarGrade = 'first-star' | 'bright-emergence' | 'proper-clarity' | 'dim-light' | 'hidden-star' | 'no-light'
export type ShadowGrade = 'perfect-twilight' | 'balanced-dusk' | 'proper-balance' | 'over-explicit' | 'over-implicit' | 'no-balance'
export type DawnGrade = 'sunrise-ready' | 'morning-prepared' | 'proper-readiness' | 'caught-off-guard' | 'asleep-at-dawn' | 'no-readiness'
export type StoneCondition = 'twilight-masterpiece' | 'evening-spire' | 'proper-tower' | 'dim-tower' | 'shadow-ruin' | 'collapsed'
export type TowerType = 'grand-cathedral' | 'proper-spire' | 'decent-tower' | 'small-minaret' | 'ruined-pillar' | 'no-tower'
export type TowerCondition = 'twilight-peak' | 'evening-tower' | 'decent-spire' | 'dim-spire' | 'shadow-ruin' | 'void'
export type ArchitectGrade = 'twilight-architect' | 'tower-master' | 'skilled-builder' | 'apprentice' | 'novice' | 'ruin-dweller'

export interface ShiftingMeasure {
  grace: number
  grade: ShiftGrade
  hasHighGrace: boolean
  hasGracefulTransitions: boolean
  hasStateManaged: boolean
  hasNoJarring: boolean
  hasSmoothFlows: boolean
  hasNoSudden: boolean
  hasProgressive: boolean
  hasNoAllAtOnce: boolean
  hasSequenced: boolean
  hasNoUnordered: boolean
  hasFlowing: boolean
  jarringCount: number
  suddenCount: number
}

export interface EnduringMeasure {
  resilience: number
  dusk: DuskGrade
  hasHighResilience: boolean
  hasErrorRecovery: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasAdaptive: boolean
  hasNoFragile: boolean
  hasVersioned: boolean
  hasNoBreakingChanges: boolean
  hasMigrationPaths: boolean
  hasNoDeadEnds: boolean
  hasFutureProof: boolean
  hardCrashCount: number
  fragileCount: number
}

export interface RevealingMeasure {
  emergence: number
  star: StarGrade
  hasHighEmergence: boolean
  hasClearAbstractions: boolean
  hasSelfDocumenting: boolean
  hasNoOverComplex: boolean
  hasEssenceVisible: boolean
  hasNoBuried: boolean
  hasCoreClear: boolean
  hasNoObfuscatedCore: boolean
  hasSimplified: boolean
  hasNoOverEngineered: boolean
  hasIlluminated: boolean
  overComplexCount: number
  buriedCount: number
}

export interface BalancingMeasure {
  balance: number
  shadow: ShadowGrade
  hasHighBalance: boolean
  hasRightLevelOfDetail: boolean
  hasNoOverDocumented: boolean
  hasNoUnderDocumented: boolean
  hasProperAbstraction: boolean
  hasNoLeakyAbstraction: boolean
  hasAppropriate: boolean
  hasNoVerbose: boolean
  hasNoCryptic: boolean
  hasConcise: boolean
  hasComplete: boolean
  overDocumentedCount: number
  underDocumentedCount: number
}

export interface PreparingMeasure {
  readiness: number
  dawn: DawnGrade
  hasHighReadiness: boolean
  hasExtensible: boolean
  hasConfigurable: boolean
  hasNoHardcoded: boolean
  hasScalable: boolean
  hasNoFixedCapacity: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasPrepared: boolean
  hardcodedCount: number
  fixedCapacityCount: number
}

export interface TwilightStone {
  file: string
  transitionGrace: number
  duskResilience: number
  starEmergence: number
  shadowBalance: number
  dawnReadiness: number
  shifting: ShiftingMeasure
  enduring: EnduringMeasure
  revealing: RevealingMeasure
  balancing: BalancingMeasure
  preparing: PreparingMeasure
  condition: StoneCondition
  qualityScore: number
}

export interface SpireTower {
  directory: string
  stones: TwilightStone[]
  avgGrace: number
  avgResilience: number
  avgReadiness: number
  twilightMasterpieceCount: number
  collapsedCount: number
  towerType: TowerType
  condition: TowerCondition
}

export interface SkylineSummary {
  avgGrace: number
  avgResilience: number
  avgReadiness: number
  isTwilight: boolean
  overallMajesty: number
}

export interface TwilightSpireStats {
  totalFiles: number
  totalTowers: number
  avgTransitionGrace: number
  avgDuskResilience: number
  avgStarEmergence: number
  avgShadowBalance: number
  avgDawnReadiness: number
  twilightMasterpieceCount: number
  eveningSpireCount: number
  properTowerCount: number
  dimTowerCount: number
  shadowRuinCount: number
  collapsedCount: number
  hasHighGraceCount: number
  hasHighResilienceCount: number
  hasHighEmergenceCount: number
  hasHighBalanceCount: number
  hasHighReadinessCount: number
  overallMajesty: number
  architectGrade: ArchitectGrade
  bestStone: string
  mostGraceful: string
  mostResilient: string
  clearestStar: string
  mostPrepared: string
}

export interface TwilightSpireResult {
  stones: TwilightStone[]
  towers: SpireTower[]
  skyline: SkylineSummary
  stats: TwilightSpireStats
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
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasFinally = (c: string) => has(/\bfinally\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure transition grace (shifting)
 * @example
 * const m = measureShifting(content)
 * console.log(m.grade) // 'seamless-twilight'
 */
export function measureShifting(content: string): ShiftingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0

  const hasGracefulTransitions = hasAsync(content) && hasTryCatch(content)
  const hasStateManaged = hasConst(content) && hasReturnType(content)
  const hasSmoothFlows = hasOptional(content) && hasNullishCoalescing(content)
  const hasProgressive = hasMapFunction(content) && hasArrowFunction(content)
  const hasSequenced = hasConditional(content) && hasExport(content)
  const hasFlowing = hasImport(content) && hasExport(content)

  score += hasGracefulTransitions ? 5 : 0
  score += hasStateManaged ? 5 : 0
  score += hasSmoothFlows ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasSequenced ? 5 : 0
  score += hasFlowing ? 5 : 0

  const grace = Math.min(score, 100)
  const jarringCount = countMatches(/\bvar\b/, content)
  const suddenCount = countMatches(/\bany\b/, content)

  const hasNoJarring = jarringCount === 0
  const hasNoSudden = suddenCount === 0
  const hasNoAllAtOnce = !has(/\beval\b/, content)
  const hasNoUnordered = !has(/\bdebugger\b/, content)
  const hasHighGrace = grace >= 70

  let grade: ShiftGrade
  if (grace >= 85) grade = 'seamless-twilight'
  else if (grace >= 70) grade = 'smooth-transition'
  else if (grace >= 55) grade = 'proper-shift'
  else if (grace >= 40) grade = 'abrupt-change'
  else if (grace >= 25) grade = 'jarring-switch'
  else grade = 'no-transition'

  return {
    grace, grade, hasHighGrace, hasGracefulTransitions, hasStateManaged,
    hasNoJarring, hasSmoothFlows, hasNoSudden, hasProgressive, hasNoAllAtOnce,
    hasSequenced, hasNoUnordered, hasFlowing, jarringCount, suddenCount,
  }
}

/**
 * Measure dusk resilience (enduring)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.dusk) // 'eternal-spire'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasFinally(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0

  const hasErrorRecovery = hasTryCatch(content) && hasThrow(content)
  const hasGracefulDegradation = hasAsync(content) && hasTryCatch(content)
  const hasAdaptive = hasOptional(content) && hasNullishCoalescing(content)
  const hasVersioned = hasEnum(content) && hasUnionType(content)
  const hasMigrationPaths = hasInterface(content) && hasReturnType(content)
  const hasFutureProof = hasConst(content) && hasStrictEq(content)

  score += hasErrorRecovery ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasMigrationPaths ? 5 : 0
  score += hasFutureProof ? 5 : 0

  const resilience = Math.min(score, 100)
  const hardCrashCount = countMatches(/\bvar\b/, content)
  const fragileCount = countMatches(/\bany\b/, content)

  const hasNoHardCrash = hardCrashCount === 0
  const hasNoFragile = fragileCount === 0
  const hasNoBreakingChanges = !has(/\beval\b/, content)
  const hasNoDeadEnds = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let dusk: DuskGrade
  if (resilience >= 85) dusk = 'eternal-spire'
  else if (resilience >= 70) dusk = 'twilight-tower'
  else if (resilience >= 55) dusk = 'proper-pillar'
  else if (resilience >= 40) dusk = 'crumbling-tower'
  else if (resilience >= 25) dusk = 'falling-stones'
  else dusk = 'no-endurance'

  return {
    resilience, dusk, hasHighResilience, hasErrorRecovery, hasGracefulDegradation,
    hasNoHardCrash, hasAdaptive, hasNoFragile, hasVersioned, hasNoBreakingChanges,
    hasMigrationPaths, hasNoDeadEnds, hasFutureProof, hardCrashCount, fragileCount,
  }
}

/**
 * Measure star emergence (revealing)
 * @example
 * const m = measureRevealing(content)
 * console.log(m.star) // 'first-star'
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasClearAbstractions = hasInterface(content) && hasReturnType(content)
  const hasSelfDocumenting = hasNamedExport(content) && hasConst(content)
  const hasEssenceVisible = hasDocComments(content) && hasReturnType(content)
  const hasCoreClear = hasGenerics(content) && hasInterface(content)
  const hasSimplified = hasMapFunction(content) && hasArrowFunction(content)
  const hasIlluminated = hasExport(content) && hasImport(content)

  score += hasClearAbstractions ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasEssenceVisible ? 5 : 0
  score += hasCoreClear ? 5 : 0
  score += hasSimplified ? 5 : 0
  score += hasIlluminated ? 5 : 0

  const emergence = Math.min(score, 100)
  const overComplexCount = countMatches(/\bvar\b/, content)
  const buriedCount = countMatches(/\bany\b/, content)

  const hasNoOverComplex = overComplexCount === 0
  const hasNoBuried = buriedCount === 0
  const hasNoObfuscatedCore = !has(/\beval\b/, content)
  const hasNoOverEngineered = !has(/\bdebugger\b/, content)
  const hasHighEmergence = emergence >= 70

  let star: StarGrade
  if (emergence >= 85) star = 'first-star'
  else if (emergence >= 70) star = 'bright-emergence'
  else if (emergence >= 55) star = 'proper-clarity'
  else if (emergence >= 40) star = 'dim-light'
  else if (emergence >= 25) star = 'hidden-star'
  else star = 'no-light'

  return {
    emergence, star, hasHighEmergence, hasClearAbstractions, hasSelfDocumenting,
    hasNoOverComplex, hasEssenceVisible, hasNoBuried, hasCoreClear, hasNoObfuscatedCore,
    hasSimplified, hasNoOverEngineered, hasIlluminated, overComplexCount, buriedCount,
  }
}

/**
 * Measure shadow balance (balancing)
 * @example
 * const m = measureBalancing(content)
 * console.log(m.shadow) // 'perfect-twilight'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasRightLevelOfDetail = hasDocComments(content) && hasReturnType(content)
  const hasProperAbstraction = hasInterface(content) && hasExport(content)
  const hasAppropriate = hasConst(content) && hasOptional(content)
  const hasConcise = hasArrowFunction(content) && hasMapFunction(content)
  const hasComplete = hasImport(content) && hasNamedExport(content)
  const hasNoLeakyAbstraction = hasInterface(content) && hasReturnType(content)

  score += hasRightLevelOfDetail ? 5 : 0
  score += hasProperAbstraction ? 5 : 0
  score += hasAppropriate ? 5 : 0
  score += hasConcise ? 5 : 0
  score += hasComplete ? 5 : 0
  score += hasNoLeakyAbstraction ? 5 : 0

  const balance = Math.min(score, 100)
  const overDocumentedCount = countMatches(/\bvar\b/, content)
  const underDocumentedCount = countMatches(/\bany\b/, content)

  const hasNoOverDocumented = overDocumentedCount === 0
  const hasNoUnderDocumented = underDocumentedCount === 0
  const hasNoVerbose = !has(/\beval\b/, content)
  const hasNoCryptic = !has(/\bdebugger\b/, content)
  const hasHighBalance = balance >= 70

  let shadow: ShadowGrade
  if (balance >= 85) shadow = 'perfect-twilight'
  else if (balance >= 70) shadow = 'balanced-dusk'
  else if (balance >= 55) shadow = 'proper-balance'
  else if (balance >= 40) shadow = 'over-explicit'
  else if (balance >= 25) shadow = 'over-implicit'
  else shadow = 'no-balance'

  return {
    balance, shadow, hasHighBalance, hasRightLevelOfDetail, hasNoOverDocumented,
    hasNoUnderDocumented, hasProperAbstraction, hasNoLeakyAbstraction, hasAppropriate,
    hasNoVerbose, hasNoCryptic, hasConcise, hasComplete, overDocumentedCount, underDocumentedCount,
  }
}

/**
 * Measure dawn readiness (preparing)
 * @example
 * const m = measurePreparing(content)
 * console.log(m.dawn) // 'sunrise-ready'
 */
export function measurePreparing(content: string): PreparingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0

  const hasExtensible = hasInterface(content) && hasGenerics(content)
  const hasConfigurable = hasOptional(content) && hasDefaultParam(content)
  const hasScalable = hasAsync(content) && hasMapFunction(content)
  const hasModular = hasExport(content) && hasImport(content)
  const hasTested = hasConst(content) && hasReturnType(content)
  const hasPrepared = hasInterface(content) && hasEnum(content)

  score += hasExtensible ? 5 : 0
  score += hasConfigurable ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasPrepared ? 5 : 0

  const readiness = Math.min(score, 100)
  const hardcodedCount = countMatches(/\bvar\b/, content)
  const fixedCapacityCount = countMatches(/\bany\b/, content)

  const hasNoHardcoded = hardcodedCount === 0
  const hasNoFixedCapacity = fixedCapacityCount === 0
  const hasNoMonolithic = !has(/\beval\b/, content)
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasHighReadiness = readiness >= 70

  let dawn: DawnGrade
  if (readiness >= 85) dawn = 'sunrise-ready'
  else if (readiness >= 70) dawn = 'morning-prepared'
  else if (readiness >= 55) dawn = 'proper-readiness'
  else if (readiness >= 40) dawn = 'caught-off-guard'
  else if (readiness >= 25) dawn = 'asleep-at-dawn'
  else dawn = 'no-readiness'

  return {
    readiness, dawn, hasHighReadiness, hasExtensible, hasConfigurable,
    hasNoHardcoded, hasScalable, hasNoFixedCapacity, hasModular, hasNoMonolithic,
    hasTested, hasNoUntested, hasPrepared, hardcodedCount, fixedCapacityCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify stone condition
 * @example
 * classifyStoneCondition(90) // 'twilight-masterpiece'
 */
export function classifyStoneCondition(score: number): StoneCondition {
  if (score >= 85) return 'twilight-masterpiece'
  if (score >= 70) return 'evening-spire'
  if (score >= 55) return 'proper-tower'
  if (score >= 40) return 'dim-tower'
  if (score >= 25) return 'shadow-ruin'
  return 'collapsed'
}

/**
 * Classify tower type
 * @example
 * classifyTowerType(stones) // 'grand-cathedral'
 */
export function classifyTowerType(stones: TwilightStone[]): TowerType {
  if (stones.length === 0) return 'no-tower'
  const avgQs = Math.round(stones.reduce((s, st) => s + st.qualityScore, 0) / stones.length)
  const masterpieceRatio = stones.filter(st => st.condition === 'twilight-masterpiece').length / stones.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-cathedral'
  if (avgQs >= 60) return 'proper-spire'
  if (avgQs >= 45) return 'decent-tower'
  if (avgQs >= 30) return 'small-minaret'
  if (avgQs >= 15) return 'ruined-pillar'
  return 'no-tower'
}

/**
 * Classify tower condition
 * @example
 * classifyTowerCondition(80) // 'twilight-peak'
 */
export function classifyTowerCondition(avgQs: number): TowerCondition {
  if (avgQs >= 75) return 'twilight-peak'
  if (avgQs >= 60) return 'evening-tower'
  if (avgQs >= 45) return 'decent-spire'
  if (avgQs >= 30) return 'dim-spire'
  if (avgQs >= 15) return 'shadow-ruin'
  return 'void'
}

/**
 * Classify architect grade
 * @example
 * classifyArchitectGrade(85) // 'twilight-architect'
 */
export function classifyArchitectGrade(avgMajesty: number): ArchitectGrade {
  if (avgMajesty >= 80) return 'twilight-architect'
  if (avgMajesty >= 65) return 'tower-master'
  if (avgMajesty >= 50) return 'skilled-builder'
  if (avgMajesty >= 35) return 'apprentice'
  if (avgMajesty >= 20) return 'novice'
  return 'ruin-dweller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(stones, towers, skyline, stats)
 */
export function generateRecommendations(
  stones: TwilightStone[],
  towers: SpireTower[],
  skyline: SkylineSummary,
  stats: TwilightSpireStats,
): string[] {
  const recs: string[] = []
  if (stats.avgTransitionGrace < 50) {
    recs.push('Improve transition grace with async patterns, try-catch flows, and smooth state management')
  }
  if (stats.avgDuskResilience < 50) {
    recs.push('Strengthen dusk resilience with error recovery, graceful degradation, and versioned types')
  }
  if (stats.avgStarEmergence < 50) {
    recs.push('Boost star emergence with clear abstractions, self-documenting names, and visible essence')
  }
  if (stats.avgShadowBalance < 50) {
    recs.push('Balance shadow interplay with right-level documentation, proper abstraction, and concise expression')
  }
  if (stats.avgDawnReadiness < 50) {
    recs.push('Prepare for dawn with extensible interfaces, configurable parameters, and modular architecture')
  }
  if (stats.collapsedCount > 0) {
    recs.push(`${stats.collapsedCount} file(s) have collapsed — they need complete twilight restoration`)
  }
  if (skyline.overallMajesty < 40) {
    recs.push('Overall majesty is low — focus on transition grace and dusk resilience first')
  }
  const allRuined = towers.every(t => t.towerType === 'no-tower' || t.towerType === 'ruined-pillar')
  if (allRuined && towers.length > 0) {
    recs.push('All towers are ruined — consider a major spire reconstruction')
  }
  const collapsedFiles = stones.filter(st => st.condition === 'collapsed').map(st => st.file)
  if (collapsedFiles.length > 0 && collapsedFiles.length <= 3) {
    recs.push(`Restore these collapsed stones: ${collapsedFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your twilight spire achieves twilight-architect grade! Every stone radiates with twilight majesty')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as twilight stone
 * @example
 * const s = analyzeTwilightStone(content, 'index.ts')
 * console.log(s.condition) // 'twilight-masterpiece'
 */
export function analyzeTwilightStone(content: string, filePath: string): TwilightStone {
  const shifting = measureShifting(content)
  const enduring = measureEnduring(content)
  const revealing = measureRevealing(content)
  const balancing = measureBalancing(content)
  const preparing = measurePreparing(content)

  const qualityScore = Math.round(
    shifting.grace * 0.2 +
    enduring.resilience * 0.2 +
    revealing.emergence * 0.2 +
    balancing.balance * 0.2 +
    preparing.readiness * 0.2,
  )

  return {
    file: filePath,
    transitionGrace: shifting.grace,
    duskResilience: enduring.resilience,
    starEmergence: revealing.emergence,
    shadowBalance: balancing.balance,
    dawnReadiness: preparing.readiness,
    shifting,
    enduring,
    revealing,
    balancing,
    preparing,
    condition: classifyStoneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as spire tower
 * @example
 * const t = analyzeSpireTower(stones, 'src')
 * console.log(t.towerType) // 'grand-cathedral'
 */
export function analyzeSpireTower(stones: TwilightStone[], dirPath: string): SpireTower {
  if (stones.length === 0) {
    return {
      directory: dirPath, stones: [], avgGrace: 0, avgResilience: 0,
      avgReadiness: 0, twilightMasterpieceCount: 0, collapsedCount: 0,
      towerType: 'no-tower', condition: 'void',
    }
  }

  const avgGrace = Math.round(stones.reduce((s, st) => s + st.transitionGrace, 0) / stones.length)
  const avgResilience = Math.round(stones.reduce((s, st) => s + st.duskResilience, 0) / stones.length)
  const avgReadiness = Math.round(stones.reduce((s, st) => s + st.dawnReadiness, 0) / stones.length)
  const twilightMasterpieceCount = stones.filter(st => st.condition === 'twilight-masterpiece').length
  const collapsedCount = stones.filter(st => st.condition === 'collapsed').length
  const avgQs = Math.round(stones.reduce((s, st) => s + st.qualityScore, 0) / stones.length)

  return {
    directory: dirPath, stones, avgGrace, avgResilience, avgReadiness,
    twilightMasterpieceCount, collapsedCount,
    towerType: classifyTowerType(stones),
    condition: classifyTowerCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete twilight spire result
 * @example
 * const result = await buildTwilightSpireResult(files, contents)
 * console.log(result.stats.architectGrade) // 'twilight-architect'
 */
export async function buildTwilightSpireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TwilightSpireResult> {
  const stones = files.map((file, i) => analyzeTwilightStone(contents[i] ?? '', file))

  const dirMap = new Map<string, TwilightStone[]>()
  for (const stone of stones) {
    const dir = path.dirname(stone.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(stone) } else { dirMap.set(dir, [stone]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, dirStones]) =>
    analyzeSpireTower(dirStones, dir),
  )

  const avgGrace = stones.length > 0
    ? Math.round(stones.reduce((s, st) => s + st.transitionGrace, 0) / stones.length) : 0
  const avgResilience = stones.length > 0
    ? Math.round(stones.reduce((s, st) => s + st.duskResilience, 0) / stones.length) : 0
  const avgReadiness = stones.length > 0
    ? Math.round(stones.reduce((s, st) => s + st.dawnReadiness, 0) / stones.length) : 0

  const overallMajesty = stones.length > 0
    ? Math.round((avgGrace + avgResilience + avgReadiness) / 3) : 0
  const isTwilight = avgGrace >= 60

  const skyline: SkylineSummary = { avgGrace, avgResilience, avgReadiness, isTwilight, overallMajesty }

  const avgStarEmergence = stones.length > 0
    ? Math.round(stones.reduce((s, st) => s + st.starEmergence, 0) / stones.length) : 0
  const avgShadowBalance = stones.length > 0
    ? Math.round(stones.reduce((s, st) => s + st.shadowBalance, 0) / stones.length) : 0

  const bestStone = stones.length > 0
    ? stones.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file : ''
  const mostGraceful = stones.length > 0
    ? stones.reduce((best, st) => st.transitionGrace > best.transitionGrace ? st : best).file : ''
  const mostResilient = stones.length > 0
    ? stones.reduce((best, st) => st.duskResilience > best.duskResilience ? st : best).file : ''
  const clearestStar = stones.length > 0
    ? stones.reduce((best, st) => st.starEmergence > best.starEmergence ? st : best).file : ''
  const mostPrepared = stones.length > 0
    ? stones.reduce((best, st) => st.dawnReadiness > best.dawnReadiness ? st : best).file : ''

  const stats: TwilightSpireStats = {
    totalFiles: stones.length,
    totalTowers: towers.length,
    avgTransitionGrace: avgGrace,
    avgDuskResilience: avgResilience,
    avgStarEmergence,
    avgShadowBalance,
    avgDawnReadiness: avgReadiness,
    twilightMasterpieceCount: stones.filter(st => st.condition === 'twilight-masterpiece').length,
    eveningSpireCount: stones.filter(st => st.condition === 'evening-spire').length,
    properTowerCount: stones.filter(st => st.condition === 'proper-tower').length,
    dimTowerCount: stones.filter(st => st.condition === 'dim-tower').length,
    shadowRuinCount: stones.filter(st => st.condition === 'shadow-ruin').length,
    collapsedCount: stones.filter(st => st.condition === 'collapsed').length,
    hasHighGraceCount: stones.filter(st => st.shifting.hasHighGrace).length,
    hasHighResilienceCount: stones.filter(st => st.enduring.hasHighResilience).length,
    hasHighEmergenceCount: stones.filter(st => st.revealing.hasHighEmergence).length,
    hasHighBalanceCount: stones.filter(st => st.balancing.hasHighBalance).length,
    hasHighReadinessCount: stones.filter(st => st.preparing.hasHighReadiness).length,
    overallMajesty,
    architectGrade: classifyArchitectGrade(overallMajesty),
    bestStone, mostGraceful, mostResilient, clearestStar, mostPrepared,
  }

  const recommendations = generateRecommendations(stones, towers, skyline, stats)

  return { stones, towers, skyline, stats, recommendations }
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
