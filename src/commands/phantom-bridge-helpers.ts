// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Bridge grade for connection stability */
export type BridgeGrade =
  | 'stone-arch'
  | 'proper-bridge'
  | 'suspension-cable'
  | 'rope-bridge'
  | 'rotting-planks'
  | 'no-bridge'

/** Ghost grade for edge case handling */
export type GhostGrade =
  | 'exorcist'
  | 'ghost-whisperer'
  | 'proper-handler'
  | 'ghost-ignorer'
  | 'haunted-code'
  | 'poltergeist'

/** Fog grade for incomplete info handling */
export type FogGrade =
  | 'lighthouse-guided'
  | 'fog-horn'
  | 'proper-compass'
  | 'lost-in-fog'
  | 'blind-wandering'
  | 'no-navigation'

/** Spirit grade for observability */
export type SpiritGrade =
  | 'crystal-clear'
  | 'transparent-ghost'
  | 'proper-visibility'
  | 'translucent'
  | 'nearly-invisible'
  | 'invisible'

/** Phantom grade for resilience */
export type PhantomGrade =
  | 'eternal-bridge'
  | 'resilient-structure'
  | 'proper-endurance'
  | 'crumbling-arch'
  | 'collapsing-bridge'
  | 'no-resilience'

/** Span condition */
export type SpanCondition =
  | 'ethereal-crossing'
  | 'solid-phantom'
  | 'proper-bridge'
  | 'crumbling-arch'
  | 'ghostly-remains'
  | 'void'

/** Crossing type */
export type CrossingType =
  | 'grand-viaduct'
  | 'proper-crossing'
  | 'decent-bridge'
  | 'narrow-footbridge'
  | 'stepping-stones'
  | 'no-crossing'

/** Crossing condition */
export type CrossingCondition =
  | 'magnificent-span'
  | 'sturdy-bridge'
  | 'decent-crossing'
  | 'rickety-planks'
  | 'broken-bridge'
  | 'void'

/** Engineer grade */
export type EngineerGrade =
  | 'master-architect'
  | 'bridge-engineer'
  | 'skilled-builder'
  | 'apprentice'
  | 'novice'
  | 'collapser'

/** Bridging measurement (connection stability) */
export interface BridgingMeasure {
  stability: number
  grade: BridgeGrade
  hasHighStability: boolean
  hasStableAPI: boolean
  hasConsistentInterface: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasBackwardCompatible: boolean
  breakingChangesCount: number
  unversionedCount: number
}

/** Haunting measurement (ghost handling) */
export interface HauntingMeasure {
  handling: number
  ghost: GhostGrade
  hasHighHandling: boolean
  hasNullChecks: boolean
  hasUndefinedGuards: boolean
  hasNoBareAccess: boolean
  hasEdgeCaseCovered: boolean
  hasNoUncovered: boolean
  hasBoundaryConditions: boolean
  hasNoMissed: boolean
  hasErrorStates: boolean
  hasNoIgnored: boolean
  hasComplete: boolean
  bareAccessCount: number
  uncoveredCount: number
}

/** Navigating measurement (fog navigation) */
export interface NavigatingMeasure {
  navigation: number
  fog: FogGrade
  hasHighNavigation: boolean
  hasDefaultValues: boolean
  hasFallbacks: boolean
  hasNoAssumptions: boolean
  hasOptionalChaining: boolean
  hasNoBareDereference: boolean
  hasValidation: boolean
  hasNoBlindTrust: boolean
  hasGracefulDegradation: boolean
  hasNoHardFailure: boolean
  hasAdaptive: boolean
  assumptionCount: number
  bareDereferenceCount: number
}

/** Revealing measurement (spirit transparency) */
export interface RevealingMeasure {
  transparency: number
  spirit: SpiritGrade
  hasHighTransparency: boolean
  hasLogging: boolean
  hasDebugInfo: boolean
  hasNoSilentOps: boolean
  hasTracing: boolean
  hasNoBlackBoxes: boolean
  hasObservable: boolean
  hasNoHiddenState: boolean
  hasMetrics: boolean
  hasNoUnmeasured: boolean
  hasReporting: boolean
  silentOpsCount: number
  blackBoxCount: number
}

/** Enduring measurement (phantom resilience) */
export interface EnduringMeasure {
  resilience: number
  phantom: PhantomGrade
  hasHighResilience: boolean
  hasTryCatch: boolean
  hasErrorRecovery: boolean
  hasNoBareThrow: boolean
  hasRetryLogic: boolean
  hasNoSinglePointFail: boolean
  hasCircuitBreaker: boolean
  hasNoCascadeFail: boolean
  hasGracefulShutdown: boolean
  hasNoHardCrash: boolean
  hasSelfHealing: boolean
  bareThrowCount: number
  singlePointFailCount: number
}

/** Single file analysis */
export interface PhantomSpan {
  file: string
  connectionStability: number
  ghostHandling: number
  fogNavigation: number
  spiritTransparency: number
  phantomResilience: number
  bridging: BridgingMeasure
  haunting: HauntingMeasure
  navigating: NavigatingMeasure
  revealing: RevealingMeasure
  enduring: EnduringMeasure
  condition: SpanCondition
  qualityScore: number
}

/** Directory-level crossing */
export interface BridgeCrossing {
  directory: string
  spans: PhantomSpan[]
  avgStability: number
  avgTransparency: number
  avgResilience: number
  etherealCrossingCount: number
  voidCount: number
  crossingType: CrossingType
  condition: CrossingCondition
}

/** Network summary */
export interface NetworkSummary {
  avgStability: number
  avgTransparency: number
  avgResilience: number
  isConnected: boolean
  overallSpanQuality: number
}

/** Full stats */
export interface PhantomBridgeStats {
  totalFiles: number
  totalCrossings: number
  avgConnectionStability: number
  avgGhostHandling: number
  avgFogNavigation: number
  avgSpiritTransparency: number
  avgPhantomResilience: number
  etherealCrossingCount: number
  solidPhantomCount: number
  properBridgeCount: number
  crumblingArchCount: number
  ghostlyRemainsCount: number
  voidCount: number
  hasHighStabilityCount: number
  hasHighHandlingCount: number
  hasHighNavigationCount: number
  hasHighTransparencyCount: number
  hasHighResilienceCount: number
  overallSpanQuality: number
  engineerGrade: EngineerGrade
  bestSpan: string
  mostStable: string
  bestGhostHandler: string
  bestNavigator: string
  mostTransparent: string
}

/** Full result */
export interface PhantomBridgeResult {
  spans: PhantomSpan[]
  crossings: BridgeCrossing[]
  network: NetworkSummary
  stats: PhantomBridgeStats
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
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure connection stability (bridging)
 * @example
 * const m = measureBridging(content)
 * console.log(m.grade) // 'stone-arch'
 */
export function measureBridging(content: string): BridgingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasStableAPI = hasExport(content) && hasReturnType(content)
  const hasConsistentInterface = hasInterface(content) && hasGenerics(content)
  const hasVersioned = hasNamedExport(content) && hasExport(content)
  const hasTyped = hasReturnType(content) && hasConst(content)
  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasBackwardCompatible = hasReadonly(content) && hasExport(content)

  score += hasStableAPI ? 5 : 0
  score += hasConsistentInterface ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasTyped ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasBackwardCompatible ? 5 : 0

  const stability = Math.min(score, 100)
  const breakingChangesCount = countMatches(/\bvar\b/, content)
  const unversionedCount = countMatches(/\bany\b/, content)

  const hasNoBreakingChanges = breakingChangesCount === 0
  const hasNoUnversioned = unversionedCount === 0
  const hasNoUntyped = !has(/\beval\b/, content)
  const hasNoUndocumented = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let grade: BridgeGrade
  if (stability >= 85) grade = 'stone-arch'
  else if (stability >= 70) grade = 'proper-bridge'
  else if (stability >= 55) grade = 'suspension-cable'
  else if (stability >= 40) grade = 'rope-bridge'
  else if (stability >= 25) grade = 'rotting-planks'
  else grade = 'no-bridge'

  return {
    stability, grade, hasHighStability, hasStableAPI, hasConsistentInterface,
    hasNoBreakingChanges, hasVersioned, hasNoUnversioned, hasTyped, hasNoUntyped,
    hasDocumented, hasNoUndocumented, hasBackwardCompatible,
    breakingChangesCount, unversionedCount,
  }
}

/**
 * Measure ghost handling (haunting)
 * @example
 * const m = measureHaunting(content)
 * console.log(m.ghost) // 'exorcist'
 */
export function measureHaunting(content: string): HauntingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasOptional(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasNullChecks = hasStrictEq(content) && hasOptional(content)
  const hasUndefinedGuards = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasEdgeCaseCovered = hasTryCatch(content) && hasReturnType(content)
  const hasBoundaryConditions = hasOptional(content) && hasNullishCoalescing(content)
  const hasErrorStates = hasTryCatch(content) && hasStrictEq(content)
  const hasComplete = hasInterface(content) && hasReturnType(content)

  score += hasNullChecks ? 5 : 0
  score += hasUndefinedGuards ? 5 : 0
  score += hasEdgeCaseCovered ? 5 : 0
  score += hasBoundaryConditions ? 5 : 0
  score += hasErrorStates ? 5 : 0
  score += hasComplete ? 5 : 0

  const handling = Math.min(score, 100)
  const bareAccessCount = countMatches(/\bvar\b/, content)
  const uncoveredCount = countMatches(/\bany\b/, content)

  const hasNoBareAccess = bareAccessCount === 0
  const hasNoUncovered = uncoveredCount === 0
  const hasNoMissed = !has(/\beval\b/, content)
  const hasNoIgnored = !has(/\bdebugger\b/, content)
  const hasHighHandling = handling >= 70

  let ghost: GhostGrade
  if (handling >= 85) ghost = 'exorcist'
  else if (handling >= 70) ghost = 'ghost-whisperer'
  else if (handling >= 55) ghost = 'proper-handler'
  else if (handling >= 40) ghost = 'ghost-ignorer'
  else if (handling >= 25) ghost = 'haunted-code'
  else ghost = 'poltergeist'

  return {
    handling, ghost, hasHighHandling, hasNullChecks, hasUndefinedGuards,
    hasNoBareAccess, hasEdgeCaseCovered, hasNoUncovered, hasBoundaryConditions,
    hasNoMissed, hasErrorStates, hasNoIgnored, hasComplete,
    bareAccessCount, uncoveredCount,
  }
}

/**
 * Measure fog navigation (navigating)
 * @example
 * const m = measureNavigating(content)
 * console.log(m.fog) // 'lighthouse-guided'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasDefaultParam(content) ? 10 : 0
  score += hasOptional(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasDefaultValues = hasDefaultParam(content) && hasConst(content)
  const hasFallbacks = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasOptionalChaining = hasOptional(content) && hasNullishCoalescing(content)
  const hasValidation = hasInterface(content) && hasReturnType(content)
  const hasGracefulDegradation = hasTryCatch(content) && hasNullishCoalescing(content)
  const hasAdaptive = hasGenerics(content) && hasOptional(content)

  score += hasDefaultValues ? 5 : 0
  score += hasFallbacks ? 5 : 0
  score += hasOptionalChaining ? 5 : 0
  score += hasValidation ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasAdaptive ? 5 : 0

  const navigation = Math.min(score, 100)
  const assumptionCount = countMatches(/\bvar\b/, content)
  const bareDereferenceCount = countMatches(/\bany\b/, content)

  const hasNoAssumptions = assumptionCount === 0
  const hasNoBareDereference = bareDereferenceCount === 0
  const hasNoBlindTrust = !has(/\beval\b/, content)
  const hasNoHardFailure = !has(/\bdebugger\b/, content)
  const hasHighNavigation = navigation >= 70

  let fog: FogGrade
  if (navigation >= 85) fog = 'lighthouse-guided'
  else if (navigation >= 70) fog = 'fog-horn'
  else if (navigation >= 55) fog = 'proper-compass'
  else if (navigation >= 40) fog = 'lost-in-fog'
  else if (navigation >= 25) fog = 'blind-wandering'
  else fog = 'no-navigation'

  return {
    navigation, fog, hasHighNavigation, hasDefaultValues, hasFallbacks,
    hasNoAssumptions, hasOptionalChaining, hasNoBareDereference, hasValidation,
    hasNoBlindTrust, hasGracefulDegradation, hasNoHardFailure, hasAdaptive,
    assumptionCount, bareDereferenceCount,
  }
}

/**
 * Measure spirit transparency (revealing)
 * @example
 * const m = measureRevealing(content)
 * console.log(m.spirit) // 'crystal-clear'
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasLogging = hasDocComments(content) && hasReturnType(content)
  const hasDebugInfo = hasNamedExport(content) && hasExport(content)
  const hasTracing = hasInterface(content) && hasConst(content)
  const hasObservable = hasReturnType(content) && hasNamedExport(content)
  const hasMetrics = hasGenerics(content) && hasReadonly(content)
  const hasReporting = hasExport(content) && hasImport(content)

  score += hasLogging ? 5 : 0
  score += hasDebugInfo ? 5 : 0
  score += hasTracing ? 5 : 0
  score += hasObservable ? 5 : 0
  score += hasMetrics ? 5 : 0
  score += hasReporting ? 5 : 0

  const transparency = Math.min(score, 100)
  const silentOpsCount = countMatches(/\bvar\b/, content)
  const blackBoxCount = countMatches(/\bany\b/, content)

  const hasNoSilentOps = silentOpsCount === 0
  const hasNoBlackBoxes = blackBoxCount === 0
  const hasNoHiddenState = !has(/\beval\b/, content)
  const hasNoUnmeasured = !has(/\bdebugger\b/, content)
  const hasHighTransparency = transparency >= 70

  let spirit: SpiritGrade
  if (transparency >= 85) spirit = 'crystal-clear'
  else if (transparency >= 70) spirit = 'transparent-ghost'
  else if (transparency >= 55) spirit = 'proper-visibility'
  else if (transparency >= 40) spirit = 'translucent'
  else if (transparency >= 25) spirit = 'nearly-invisible'
  else spirit = 'invisible'

  return {
    transparency, spirit, hasHighTransparency, hasLogging, hasDebugInfo,
    hasNoSilentOps, hasTracing, hasNoBlackBoxes, hasObservable, hasNoHiddenState,
    hasMetrics, hasNoUnmeasured, hasReporting, silentOpsCount, blackBoxCount,
  }
}

/**
 * Measure phantom resilience (enduring)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.phantom) // 'eternal-bridge'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasErrorRecovery = hasTryCatch(content) && hasReturnType(content)
  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasCircuitBreaker = hasStrictEq(content) && hasConst(content)
  const hasGracefulShutdown = hasOptional(content) && hasNullishCoalescing(content)
  const hasSelfHealing = hasDefaultParam(content) && hasTryCatch(content)
  const hasNoBareThrow = hasInterface(content) && hasReturnType(content)

  score += hasErrorRecovery ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasCircuitBreaker ? 5 : 0
  score += hasGracefulShutdown ? 5 : 0
  score += hasSelfHealing ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareThrowCount = countMatches(/\bvar\b/, content)
  const singlePointFailCount = countMatches(/\bany\b/, content)

  const hasNoSinglePointFail = singlePointFailCount === 0
  const hasNoCascadeFail = !has(/\beval\b/, content)
  const hasNoHardCrash = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let phantom: PhantomGrade
  if (resilience >= 85) phantom = 'eternal-bridge'
  else if (resilience >= 70) phantom = 'resilient-structure'
  else if (resilience >= 55) phantom = 'proper-endurance'
  else if (resilience >= 40) phantom = 'crumbling-arch'
  else if (resilience >= 25) phantom = 'collapsing-bridge'
  else phantom = 'no-resilience'

  return {
    resilience, phantom, hasHighResilience, hasTryCatch: hasTryCatch(content), hasErrorRecovery,
    hasNoBareThrow, hasRetryLogic, hasNoSinglePointFail, hasCircuitBreaker,
    hasNoCascadeFail, hasGracefulShutdown, hasNoHardCrash, hasSelfHealing,
    bareThrowCount, singlePointFailCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify span condition
 * @example
 * classifySpanCondition(90) // 'ethereal-crossing'
 */
export function classifySpanCondition(score: number): SpanCondition {
  if (score >= 85) return 'ethereal-crossing'
  if (score >= 70) return 'solid-phantom'
  if (score >= 55) return 'proper-bridge'
  if (score >= 40) return 'crumbling-arch'
  if (score >= 25) return 'ghostly-remains'
  return 'void'
}

/**
 * Classify crossing type
 * @example
 * classifyCrossingType(spans) // 'grand-viaduct'
 */
export function classifyCrossingType(spans: PhantomSpan[]): CrossingType {
  if (spans.length === 0) return 'no-crossing'
  const avgQs = Math.round(spans.reduce((s, p) => s + p.qualityScore, 0) / spans.length)
  const etherealRatio = spans.filter(p => p.condition === 'ethereal-crossing').length / spans.length
  if (avgQs >= 75 && etherealRatio >= 0.5) return 'grand-viaduct'
  if (avgQs >= 60) return 'proper-crossing'
  if (avgQs >= 45) return 'decent-bridge'
  if (avgQs >= 30) return 'narrow-footbridge'
  if (avgQs >= 15) return 'stepping-stones'
  return 'no-crossing'
}

/**
 * Classify crossing condition
 * @example
 * classifyCrossingCondition(80) // 'magnificent-span'
 */
export function classifyCrossingCondition(avgQs: number): CrossingCondition {
  if (avgQs >= 75) return 'magnificent-span'
  if (avgQs >= 60) return 'sturdy-bridge'
  if (avgQs >= 45) return 'decent-crossing'
  if (avgQs >= 30) return 'rickety-planks'
  if (avgQs >= 15) return 'broken-bridge'
  return 'void'
}

/**
 * Classify engineer grade
 * @example
 * classifyEngineerGrade(85) // 'master-architect'
 */
export function classifyEngineerGrade(avgQuality: number): EngineerGrade {
  if (avgQuality >= 80) return 'master-architect'
  if (avgQuality >= 65) return 'bridge-engineer'
  if (avgQuality >= 50) return 'skilled-builder'
  if (avgQuality >= 35) return 'apprentice'
  if (avgQuality >= 20) return 'novice'
  return 'collapser'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(spans, crossings, network, stats)
 */
export function generateRecommendations(
  spans: PhantomSpan[],
  crossings: BridgeCrossing[],
  network: NetworkSummary,
  stats: PhantomBridgeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgConnectionStability < 50) {
    recs.push('Strengthen connection stability with stable APIs, consistent interfaces, and typed exports')
  }
  if (stats.avgGhostHandling < 50) {
    recs.push('Improve ghost handling with null checks, undefined guards, and edge case coverage')
  }
  if (stats.avgFogNavigation < 50) {
    recs.push('Navigate the fog with default values, fallback patterns, and graceful degradation')
  }
  if (stats.avgSpiritTransparency < 50) {
    recs.push('Increase spirit transparency with documentation, logging, and observable exports')
  }
  if (stats.avgPhantomResilience < 50) {
    recs.push('Build phantom resilience with error recovery, circuit breakers, and graceful shutdown')
  }
  if (stats.voidCount > 0) {
    recs.push(`${stats.voidCount} file(s) are void — they need complete phantom bridge restoration`)
  }
  if (network.overallSpanQuality < 40) {
    recs.push('Overall span quality is low — focus on connection stability and ghost handling first')
  }
  const allBroken = crossings.every(c => c.crossingType === 'no-crossing' || c.crossingType === 'stepping-stones')
  if (allBroken && crossings.length > 0) {
    recs.push('All crossings are broken — consider a major bridge reconstruction')
  }
  const voidFiles = spans.filter(p => p.condition === 'void').map(p => p.file)
  if (voidFiles.length > 0 && voidFiles.length <= 3) {
    recs.push(`Restore these void files into phantom bridge spans: ${voidFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your phantom bridge achieves master architect quality! Every span shines with ethereal stability')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as phantom span
 * @example
 * const s = analyzePhantomSpan(content, 'index.ts')
 * console.log(s.condition) // 'ethereal-crossing'
 */
export function analyzePhantomSpan(content: string, filePath: string): PhantomSpan {
  const bridging = measureBridging(content)
  const haunting = measureHaunting(content)
  const navigating = measureNavigating(content)
  const revealing = measureRevealing(content)
  const enduring = measureEnduring(content)

  const qualityScore = Math.round(
    bridging.stability * 0.2 +
    haunting.handling * 0.2 +
    navigating.navigation * 0.2 +
    revealing.transparency * 0.2 +
    enduring.resilience * 0.2,
  )

  return {
    file: filePath,
    connectionStability: bridging.stability,
    ghostHandling: haunting.handling,
    fogNavigation: navigating.navigation,
    spiritTransparency: revealing.transparency,
    phantomResilience: enduring.resilience,
    bridging,
    haunting,
    navigating,
    revealing,
    enduring,
    condition: classifySpanCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as bridge crossing
 * @example
 * const c = analyzeBridgeCrossing(spans, 'src')
 * console.log(c.crossingType) // 'grand-viaduct'
 */
export function analyzeBridgeCrossing(spans: PhantomSpan[], dirPath: string): BridgeCrossing {
  if (spans.length === 0) {
    return {
      directory: dirPath, spans: [], avgStability: 0, avgTransparency: 0,
      avgResilience: 0, etherealCrossingCount: 0, voidCount: 0,
      crossingType: 'no-crossing', condition: 'void',
    }
  }

  const avgStability = Math.round(spans.reduce((s, p) => s + p.connectionStability, 0) / spans.length)
  const avgTransparency = Math.round(spans.reduce((s, p) => s + p.spiritTransparency, 0) / spans.length)
  const avgResilience = Math.round(spans.reduce((s, p) => s + p.phantomResilience, 0) / spans.length)
  const etherealCrossingCount = spans.filter(p => p.condition === 'ethereal-crossing').length
  const voidCount = spans.filter(p => p.condition === 'void').length
  const avgQs = Math.round(spans.reduce((s, p) => s + p.qualityScore, 0) / spans.length)

  return {
    directory: dirPath, spans, avgStability, avgTransparency, avgResilience,
    etherealCrossingCount, voidCount, crossingType: classifyCrossingType(spans),
    condition: classifyCrossingCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete phantom bridge result
 * @example
 * const result = await buildPhantomBridgeResult(files, contents)
 * console.log(result.stats.engineerGrade) // 'master-architect'
 */
export async function buildPhantomBridgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomBridgeResult> {
  const spans = files.map((file, i) => analyzePhantomSpan(contents[i] ?? '', file))

  const dirMap = new Map<string, PhantomSpan[]>()
  for (const span of spans) {
    const dir = path.dirname(span.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(span) } else { dirMap.set(dir, [span]) }
  }

  const crossings = Array.from(dirMap.entries()).map(([dir, dirSpans]) =>
    analyzeBridgeCrossing(dirSpans, dir),
  )

  const avgStability = spans.length > 0
    ? Math.round(spans.reduce((s, p) => s + p.connectionStability, 0) / spans.length) : 0
  const avgTransparency = spans.length > 0
    ? Math.round(spans.reduce((s, p) => s + p.spiritTransparency, 0) / spans.length) : 0
  const avgResilience = spans.length > 0
    ? Math.round(spans.reduce((s, p) => s + p.phantomResilience, 0) / spans.length) : 0

  const overallSpanQuality = spans.length > 0
    ? Math.round((avgStability + avgTransparency + avgResilience) / 3) : 0
  const isConnected = avgStability >= 60

  const network: NetworkSummary = { avgStability, avgTransparency, avgResilience, isConnected, overallSpanQuality }

  const avgGhostHandling = spans.length > 0
    ? Math.round(spans.reduce((s, p) => s + p.ghostHandling, 0) / spans.length) : 0
  const avgFogNavigation = spans.length > 0
    ? Math.round(spans.reduce((s, p) => s + p.fogNavigation, 0) / spans.length) : 0
    ? Math.round(spans.reduce((s, p) => s + p.phantomResilience, 0) / spans.length) : 0

  const bestSpan = spans.length > 0
    ? spans.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const mostStable = spans.length > 0
    ? spans.reduce((best, p) => p.connectionStability > best.connectionStability ? p : best).file : ''
  const bestGhostHandler = spans.length > 0
    ? spans.reduce((best, p) => p.ghostHandling > best.ghostHandling ? p : best).file : ''
  const bestNavigator = spans.length > 0
    ? spans.reduce((best, p) => p.fogNavigation > best.fogNavigation ? p : best).file : ''
  const mostTransparent = spans.length > 0
    ? spans.reduce((best, p) => p.spiritTransparency > best.spiritTransparency ? p : best).file : ''

  const stats: PhantomBridgeStats = {
    totalFiles: spans.length,
    totalCrossings: crossings.length,
    avgConnectionStability: avgStability,
    avgGhostHandling,
    avgFogNavigation,
    avgSpiritTransparency: avgTransparency,
    avgPhantomResilience: avgResilience,
    etherealCrossingCount: spans.filter(p => p.condition === 'ethereal-crossing').length,
    solidPhantomCount: spans.filter(p => p.condition === 'solid-phantom').length,
    properBridgeCount: spans.filter(p => p.condition === 'proper-bridge').length,
    crumblingArchCount: spans.filter(p => p.condition === 'crumbling-arch').length,
    ghostlyRemainsCount: spans.filter(p => p.condition === 'ghostly-remains').length,
    voidCount: spans.filter(p => p.condition === 'void').length,
    hasHighStabilityCount: spans.filter(p => p.bridging.hasHighStability).length,
    hasHighHandlingCount: spans.filter(p => p.haunting.hasHighHandling).length,
    hasHighNavigationCount: spans.filter(p => p.navigating.hasHighNavigation).length,
    hasHighTransparencyCount: spans.filter(p => p.revealing.hasHighTransparency).length,
    hasHighResilienceCount: spans.filter(p => p.enduring.hasHighResilience).length,
    overallSpanQuality,
    engineerGrade: classifyEngineerGrade(overallSpanQuality),
    bestSpan, mostStable, bestGhostHandler, bestNavigator, mostTransparent,
  }

  const recommendations = generateRecommendations(spans, crossings, network, stats)

  return { spans, crossings, network, stats, recommendations }
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
