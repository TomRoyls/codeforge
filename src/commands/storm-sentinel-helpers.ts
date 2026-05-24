// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ObservingGrade = 'all-seeing-eye' | 'watchful-tower' | 'proper-lookout' | 'sleeping-guard' | 'blind-spot' | 'no-watch'
export type WarningLevel = 'early-warning' | 'proper-alert' | 'decent-warning' | 'reactive-only' | 'no-warning' | 'no-alert'
export type ResponseLightning = 'instant-ground' | 'fast-response' | 'proper-handling' | 'slow-reaction' | 'delayed-response' | 'no-response'
export type ResilienceThunder = 'unshakeable-tower' | 'storm-proof' | 'proper-endurance' | 'storm-damaged' | 'collapsing-tower' | 'no-endurance'
export type VigilanceGuardian = 'eternal-sentinel' | 'watchful-guardian' | 'proper-protector' | 'drowsy-watchman' | 'absent-guard' | 'no-guard'
export type WatchCondition = 'perfect-sentinel' | 'storm-tower' | 'proper-watchtower' | 'weathered-post' | 'fallen-tower' | 'rubble'
export type OutpostType = 'fortress-watch' | 'sentinel-network' | 'proper-outpost' | 'lone-tower' | 'abandoned-post' | 'no-outpost'
export type OutpostCondition = 'impregnable-watch' | 'strong-network' | 'decent-coverage' | 'weak-outpost' | 'fallen-sentry' | 'void'
export type CommanderGrade = 'sentinel-supreme' | 'watch-commander' | 'skilled-guard' | 'apprentice' | 'novice' | 'deserter'

export interface ObservingMeasure {
  watch: number
  grade: ObservingGrade
  hasHighWatch: boolean
  hasLogging: boolean
  hasDebugInfo: boolean
  hasNoSilentOps: boolean
  hasTracing: boolean
  hasNoBlackBoxes: boolean
  hasMetrics: boolean
  hasNoUnmeasured: boolean
  hasReporting: boolean
  hasNoHiddenState: boolean
  hasObservable: boolean
  silentOpsCount: number
  blackBoxCount: number
}

export interface WarningMeasure {
  anticipation: number
  warning: WarningLevel
  hasHighWarning: boolean
  hasErrorAnticipation: boolean
  hasPreconditionChecks: boolean
  hasNoUnassumed: boolean
  hasInputValidation: boolean
  hasNoUnchecked: boolean
  hasTypeGuards: boolean
  hasNoCasting: boolean
  hasBoundaryChecks: boolean
  hasNoUnbounded: boolean
  hasProactive: boolean
  uncheckedCount: number
  castingCount: number
}

export interface RespondingMeasure {
  response: number
  lightning: ResponseLightning
  hasHighResponse: boolean
  hasErrorHandling: boolean
  hasTryCatch: boolean
  hasNoBareThrow: boolean
  hasErrorRecovery: boolean
  hasNoSwallowed: boolean
  hasGracefulHandling: boolean
  hasNoSilentFail: boolean
  hasRapidRecovery: boolean
  hasNoHanging: boolean
  hasResponsive: boolean
  bareThrowCount: number
  swallowedCount: number
}

export interface EnduringMeasure {
  resilience: number
  thunder: ResilienceThunder
  hasHighResilience: boolean
  hasCircuitBreaker: boolean
  hasRetryLogic: boolean
  hasNoCascadeFail: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasFallbackPaths: boolean
  hasNoSinglePointFail: boolean
  hasIsolation: boolean
  hasNoContagion: boolean
  hasSelfHealing: boolean
  cascadeFailCount: number
  singlePointFailCount: number
}

export interface GuardingMeasure {
  vigilance: number
  guardian: VigilanceGuardian
  hasHighVigilance: boolean
  hasInputSanitization: boolean
  hasOutputEncoding: boolean
  hasNoRawExposure: boolean
  hasDefensiveCode: boolean
  hasNoTrusting: boolean
  hasSecurityChecks: boolean
  hasNoVulnerabilities: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasVigilant: boolean
  rawExposureCount: number
  trustingCount: number
}

export interface SentinelWatch {
  file: string
  watchfulness: number
  stormWarning: number
  lightningResponse: number
  thunderResilience: number
  guardianVigilance: number
  observing: ObservingMeasure
  warning: WarningMeasure
  responding: RespondingMeasure
  enduring: EnduringMeasure
  guarding: GuardingMeasure
  condition: WatchCondition
  qualityScore: number
}

export interface SentinelOutpost {
  directory: string
  watches: SentinelWatch[]
  avgWatchfulness: number
  avgResponse: number
  avgVigilance: number
  perfectSentinelCount: number
  rubbleCount: number
  outpostType: OutpostType
  condition: OutpostCondition
}

export interface StormNetwork {
  avgWatchfulness: number
  avgResponse: number
  avgVigilance: number
  isVigilant: boolean
  overallProtection: number
}

export interface StormSentinelStats {
  totalFiles: number
  totalOutposts: number
  avgWatchfulness: number
  avgStormWarning: number
  avgLightningResponse: number
  avgThunderResilience: number
  avgGuardianVigilance: number
  perfectSentinelCount: number
  stormTowerCount: number
  properWatchtowerCount: number
  weatheredPostCount: number
  fallenTowerCount: number
  rubbleCount: number
  hasHighWatchCount: number
  hasHighWarningCount: number
  hasHighResponseCount: number
  hasHighResilienceCount: number
  hasHighVigilanceCount: number
  overallProtection: number
  commanderGrade: CommanderGrade
  bestWatch: string
  mostWatchful: string
  bestWarning: string
  fastestResponse: string
  mostVigilant: string
}

export interface StormSentinelResult {
  watches: SentinelWatch[]
  outposts: SentinelOutpost[]
  network: StormNetwork
  stats: StormSentinelStats
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
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^=]/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure watchfulness (observability/monitoring)
 * @example
 * const m = measureObserving(content)
 * console.log(m.grade) // 'all-seeing-eye'
 */
export function measureObserving(content: string): ObservingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasStrictEq(content) ? 4 : 0

  const hasLogging = hasDocComments(content) && hasExport(content)
  const hasTracing = hasReturnType(content) && hasInterface(content)
  const hasMetrics = hasNamedExport(content) && hasConst(content)
  const hasReporting = hasTypeAlias(content) && hasEnum(content)
  const hasObservable = hasReadonly(content) && hasOptional(content)
  const hasDebugInfo = hasGenerics(content) && hasStrictEq(content)

  score += hasLogging ? 5 : 0
  score += hasTracing ? 5 : 0
  score += hasMetrics ? 5 : 0
  score += hasReporting ? 5 : 0
  score += hasObservable ? 5 : 0
  score += hasDebugInfo ? 5 : 0

  const watch = Math.min(score, 100)
  const silentOpsCount = countMatches(/\bvar\b/, content)
  const blackBoxCount = countMatches(/\bany\b/, content)

  const hasNoSilentOps = silentOpsCount === 0
  const hasNoBlackBoxes = blackBoxCount === 0
  const hasNoUnmeasured = countMatches(/\beval\b/, content) === 0
  const hasNoHiddenState = !has(/\bdebugger\b/, content)
  const hasHighWatch = watch >= 70

  let grade: ObservingGrade
  if (watch >= 85) grade = 'all-seeing-eye'
  else if (watch >= 70) grade = 'watchful-tower'
  else if (watch >= 55) grade = 'proper-lookout'
  else if (watch >= 40) grade = 'sleeping-guard'
  else if (watch >= 25) grade = 'blind-spot'
  else grade = 'no-watch'

  return {
    watch, grade, hasHighWatch, hasLogging, hasDebugInfo, hasNoSilentOps,
    hasTracing, hasNoBlackBoxes, hasMetrics, hasNoUnmeasured, hasReporting,
    hasNoHiddenState, hasObservable, silentOpsCount, blackBoxCount,
  }
}

/**
 * Measure storm warning (error anticipation)
 * @example
 * const m = measureWarning(content)
 * console.log(m.warning) // 'early-warning'
 */
export function measureWarning(content: string): WarningMeasure {
  let score = 0
  score += hasConditional(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasNullishCoalescing(content) ? 4 : 0

  const hasErrorAnticipation = hasConditional(content) && hasStrictEq(content)
  const hasInputValidation = hasOptional(content) && hasEnum(content)
  const hasTypeGuards = hasTypeAlias(content) && hasUnionType(content)
  const hasBoundaryChecks = hasReturnType(content) && hasInterface(content)
  const hasPreconditionChecks = hasGenerics(content) && hasReadonly(content)
  const hasProactive = hasExport(content) && hasNullishCoalescing(content)

  score += hasErrorAnticipation ? 5 : 0
  score += hasInputValidation ? 5 : 0
  score += hasTypeGuards ? 5 : 0
  score += hasBoundaryChecks ? 5 : 0
  score += hasPreconditionChecks ? 5 : 0
  score += hasProactive ? 5 : 0

  const anticipation = Math.min(score, 100)
  const uncheckedCount = countMatches(/\bvar\b/, content)
  const castingCount = countMatches(/\bany\b/, content)

  const hasNoUnassumed = uncheckedCount === 0
  const hasNoUnchecked = castingCount === 0
  const hasNoCasting = countMatches(/\beval\b/, content) === 0
  const hasNoUnbounded = !has(/\bdebugger\b/, content)
  const hasHighWarning = anticipation >= 70

  let warning: WarningLevel
  if (anticipation >= 85) warning = 'early-warning'
  else if (anticipation >= 70) warning = 'proper-alert'
  else if (anticipation >= 55) warning = 'decent-warning'
  else if (anticipation >= 40) warning = 'reactive-only'
  else if (anticipation >= 25) warning = 'no-warning'
  else warning = 'no-alert'

  return {
    anticipation, warning, hasHighWarning, hasErrorAnticipation,
    hasPreconditionChecks, hasNoUnassumed, hasInputValidation, hasNoUnchecked,
    hasTypeGuards, hasNoCasting, hasBoundaryChecks, hasNoUnbounded, hasProactive,
    uncheckedCount, castingCount,
  }
}

/**
 * Measure lightning response (rapid error handling)
 * @example
 * const m = measureResponding(content)
 * console.log(m.lightning) // 'instant-ground'
 */
export function measureResponding(content: string): RespondingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 4 : 0
  score += hasDefaultParam(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0

  const didTryCatch = hasTryCatch(content)
  const hasErrorHandling = didTryCatch && hasThrow(content)
  const hasErrorRecovery = hasConditional(content) && hasStrictEq(content)
  const hasGracefulHandling = hasAsync(content) && hasReturnType(content)
  const hasRapidRecovery = hasExport(content) && hasInterface(content)
  const hasNoBareThrow = didTryCatch || !hasThrow(content)
  const hasResponsive = hasNullishCoalescing(content) && hasDefaultParam(content)

  score += hasErrorHandling ? 5 : 0
  score += hasErrorRecovery ? 5 : 0
  score += hasGracefulHandling ? 5 : 0
  score += hasRapidRecovery ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += (hasConst(content) && hasOptional(content)) ? 5 : 0

  const response = Math.min(score, 100)
  const bareThrowCount = countMatches(/\bvar\b/, content)
  const swallowedCount = countMatches(/\beval\b/, content)

  const hasNoSwallowed = swallowedCount === 0
  const hasNoSilentFail = countMatches(/\bany\b/, content) === 0
  const hasNoHanging = !has(/\bdebugger\b/, content)
  const hasHighResponse = response >= 70

  let lightning: ResponseLightning
  if (response >= 85) lightning = 'instant-ground'
  else if (response >= 70) lightning = 'fast-response'
  else if (response >= 55) lightning = 'proper-handling'
  else if (response >= 40) lightning = 'slow-reaction'
  else if (response >= 25) lightning = 'delayed-response'
  else lightning = 'no-response'

  return {
    response, lightning, hasHighResponse, hasErrorHandling, hasTryCatch: didTryCatch,
    hasNoBareThrow, hasErrorRecovery, hasNoSwallowed, hasGracefulHandling,
    hasNoSilentFail, hasRapidRecovery, hasNoHanging, hasResponsive,
    bareThrowCount, swallowedCount,
  }
}

/**
 * Measure thunder resilience (cascading failure endurance)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.thunder) // 'unshakeable-tower'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasConst(content) ? 4 : 0

  const hasCircuitBreaker = hasTryCatch(content) && hasConditional(content)
  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasGracefulDegradation = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasFallbackPaths = hasExport(content) && hasReturnType(content)
  const hasIsolation = hasInterface(content) && hasOptional(content)
  const hasSelfHealing = hasThrow(content) && hasStrictEq(content)

  score += hasCircuitBreaker ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasFallbackPaths ? 5 : 0
  score += hasIsolation ? 5 : 0
  score += hasSelfHealing ? 5 : 0

  const resilience = Math.min(score, 100)
  const cascadeFailCount = countMatches(/\bvar\b/, content)
  const singlePointFailCount = countMatches(/\beval\b/, content)

  const hasNoCascadeFail = cascadeFailCount === 0
  const hasNoHardCrash = countMatches(/\bany\b/, content) === 0
  const hasNoSinglePointFail = singlePointFailCount === 0
  const hasNoContagion = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let thunder: ResilienceThunder
  if (resilience >= 85) thunder = 'unshakeable-tower'
  else if (resilience >= 70) thunder = 'storm-proof'
  else if (resilience >= 55) thunder = 'proper-endurance'
  else if (resilience >= 40) thunder = 'storm-damaged'
  else if (resilience >= 25) thunder = 'collapsing-tower'
  else thunder = 'no-endurance'

  return {
    resilience, thunder, hasHighResilience, hasCircuitBreaker, hasRetryLogic,
    hasNoCascadeFail, hasGracefulDegradation, hasNoHardCrash, hasFallbackPaths,
    hasNoSinglePointFail, hasIsolation, hasNoContagion, hasSelfHealing,
    cascadeFailCount, singlePointFailCount,
  }
}

/**
 * Measure guardian vigilance (proactive protection)
 * @example
 * const m = measureGuarding(content)
 * console.log(m.guardian) // 'eternal-sentinel'
 */
export function measureGuarding(content: string): GuardingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasInputSanitization = hasInterface(content) && hasReturnType(content)
  const hasDefensiveCode = hasStrictEq(content) && hasExport(content)
  const hasSecurityChecks = hasReadonly(content) && hasPrivate(content)
  const hasOutputEncoding = hasEnum(content) && hasTypeAlias(content)
  const hasProtected = hasConst(content) && hasOptional(content)
  const hasVigilant = hasGenerics(content) && hasDocComments(content)

  score += hasInputSanitization ? 5 : 0
  score += hasDefensiveCode ? 5 : 0
  score += hasSecurityChecks ? 5 : 0
  score += hasOutputEncoding ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasVigilant ? 5 : 0

  const vigilance = Math.min(score, 100)
  const rawExposureCount = countMatches(/\bvar\b/, content)
  const trustingCount = countMatches(/\bany\b/, content)

  const hasNoRawExposure = rawExposureCount === 0
  const hasNoTrusting = trustingCount === 0
  const hasNoVulnerabilities = countMatches(/\beval\b/, content) === 0
  const hasNoExposed = !has(/\bdebugger\b/, content)
  const hasHighVigilance = vigilance >= 70

  let guardian: VigilanceGuardian
  if (vigilance >= 85) guardian = 'eternal-sentinel'
  else if (vigilance >= 70) guardian = 'watchful-guardian'
  else if (vigilance >= 55) guardian = 'proper-protector'
  else if (vigilance >= 40) guardian = 'drowsy-watchman'
  else if (vigilance >= 25) guardian = 'absent-guard'
  else guardian = 'no-guard'

  return {
    vigilance, guardian, hasHighVigilance, hasInputSanitization, hasOutputEncoding,
    hasNoRawExposure, hasDefensiveCode, hasNoTrusting, hasSecurityChecks,
    hasNoVulnerabilities, hasProtected, hasNoExposed, hasVigilant,
    rawExposureCount, trustingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify watch condition
 * @example
 * classifyWatchCondition(90) // 'perfect-sentinel'
 */
export function classifyWatchCondition(score: number): WatchCondition {
  if (score >= 85) return 'perfect-sentinel'
  if (score >= 70) return 'storm-tower'
  if (score >= 55) return 'proper-watchtower'
  if (score >= 40) return 'weathered-post'
  if (score >= 25) return 'fallen-tower'
  return 'rubble'
}

/**
 * Classify outpost type
 * @example
 * classifyOutpostType(watches) // 'fortress-watch'
 */
export function classifyOutpostType(watches: SentinelWatch[]): OutpostType {
  if (watches.length === 0) return 'no-outpost'
  const avgQs = Math.round(watches.reduce((s, w) => s + w.qualityScore, 0) / watches.length)
  const perfectRatio = watches.filter(w => w.condition === 'perfect-sentinel').length / watches.length
  if (avgQs >= 75 && perfectRatio >= 0.5) return 'fortress-watch'
  if (avgQs >= 60) return 'sentinel-network'
  if (avgQs >= 45) return 'proper-outpost'
  if (avgQs >= 30) return 'lone-tower'
  if (avgQs >= 15) return 'abandoned-post'
  return 'no-outpost'
}

/**
 * Classify outpost condition
 * @example
 * classifyOutpostCondition(80) // 'impregnable-watch'
 */
export function classifyOutpostCondition(avgQs: number): OutpostCondition {
  if (avgQs >= 75) return 'impregnable-watch'
  if (avgQs >= 60) return 'strong-network'
  if (avgQs >= 45) return 'decent-coverage'
  if (avgQs >= 30) return 'weak-outpost'
  if (avgQs >= 15) return 'fallen-sentry'
  return 'void'
}

/**
 * Classify commander grade
 * @example
 * classifyCommanderGrade(85) // 'sentinel-supreme'
 */
export function classifyCommanderGrade(avgProtection: number): CommanderGrade {
  if (avgProtection >= 80) return 'sentinel-supreme'
  if (avgProtection >= 65) return 'watch-commander'
  if (avgProtection >= 50) return 'skilled-guard'
  if (avgProtection >= 35) return 'apprentice'
  if (avgProtection >= 20) return 'novice'
  return 'deserter'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(watches, outposts, network, stats)
 */
export function generateRecommendations(
  watches: SentinelWatch[],
  outposts: SentinelOutpost[],
  network: StormNetwork,
  stats: StormSentinelStats,
): string[] {
  const recs: string[] = []
  if (stats.avgWatchfulness < 50) {
    recs.push('Increase watchfulness with logging, tracing, metrics, and observable exports')
  }
  if (stats.avgStormWarning < 50) {
    recs.push('Improve storm warning with input validation, type guards, and precondition checks')
  }
  if (stats.avgLightningResponse < 50) {
    recs.push('Enhance lightning response with error handling, try/catch, and graceful recovery')
  }
  if (stats.avgThunderResilience < 50) {
    recs.push('Bolster thunder resilience with circuit breakers, retry logic, and graceful degradation')
  }
  if (stats.avgGuardianVigilance < 50) {
    recs.push('Strengthen guardian vigilance with defensive coding, security checks, and access control')
  }
  if (stats.rubbleCount > 0) {
    recs.push(`${stats.rubbleCount} file(s) are rubble — they need complete sentinel reconstruction`)
  }
  if (network.overallProtection < 40) {
    recs.push('Overall protection is dangerously low — focus on watchfulness and response first')
  }
  const allWeak = outposts.every(o => o.outpostType === 'no-outpost' || o.outpostType === 'abandoned-post')
  if (allWeak && outposts.length > 0) {
    recs.push('All outposts are weak — consider a major sentinel network reconstruction')
  }
  const rubbleFiles = watches.filter(w => w.condition === 'rubble').map(w => w.file)
  if (rubbleFiles.length > 0 && rubbleFiles.length <= 3) {
    recs.push(`Rebuild these rubble files: ${rubbleFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The storm sentinel stands eternal! Perfect watchfulness, warning, response, resilience, and vigilance across the entire network')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as sentinel watch
 * @example
 * const watch = analyzeSentinelWatch(content, 'index.ts')
 * console.log(watch.condition) // 'perfect-sentinel'
 */
export function analyzeSentinelWatch(content: string, filePath: string): SentinelWatch {
  const observing = measureObserving(content)
  const warning = measureWarning(content)
  const responding = measureResponding(content)
  const enduring = measureEnduring(content)
  const guarding = measureGuarding(content)

  const qualityScore = Math.round(
    observing.watch * 0.2 +
    warning.anticipation * 0.2 +
    responding.response * 0.2 +
    enduring.resilience * 0.2 +
    guarding.vigilance * 0.2,
  )

  return {
    file: filePath,
    watchfulness: observing.watch,
    stormWarning: warning.anticipation,
    lightningResponse: responding.response,
    thunderResilience: enduring.resilience,
    guardianVigilance: guarding.vigilance,
    observing, warning, responding, enduring, guarding,
    condition: classifyWatchCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as sentinel outpost
 * @example
 * const outpost = analyzeSentinelOutpost(watches, 'src')
 * console.log(outpost.outpostType) // 'fortress-watch'
 */
export function analyzeSentinelOutpost(watches: SentinelWatch[], dirPath: string): SentinelOutpost {
  if (watches.length === 0) {
    return {
      directory: dirPath, watches: [], avgWatchfulness: 0, avgResponse: 0,
      avgVigilance: 0, perfectSentinelCount: 0, rubbleCount: 0,
      outpostType: 'no-outpost', condition: 'void',
    }
  }

  const avgWatchfulness = Math.round(watches.reduce((s, w) => s + w.watchfulness, 0) / watches.length)
  const avgResponse = Math.round(watches.reduce((s, w) => s + w.lightningResponse, 0) / watches.length)
  const avgVigilance = Math.round(watches.reduce((s, w) => s + w.guardianVigilance, 0) / watches.length)
  const perfectSentinelCount = watches.filter(w => w.condition === 'perfect-sentinel').length
  const rubbleCount = watches.filter(w => w.condition === 'rubble').length
  const avgQs = Math.round(watches.reduce((s, w) => s + w.qualityScore, 0) / watches.length)

  return {
    directory: dirPath, watches, avgWatchfulness, avgResponse, avgVigilance,
    perfectSentinelCount, rubbleCount,
    outpostType: classifyOutpostType(watches),
    condition: classifyOutpostCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete storm sentinel result
 * @example
 * const result = await buildStormSentinelResult(files, contents)
 * console.log(result.stats.commanderGrade) // 'sentinel-supreme'
 */
export async function buildStormSentinelResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StormSentinelResult> {
  const watches = files.map((file, i) => analyzeSentinelWatch(contents[i] ?? '', file))

  const dirMap = new Map<string, SentinelWatch[]>()
  for (const watch of watches) {
    const dir = path.dirname(watch.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(watch) } else { dirMap.set(dir, [watch]) }
  }

  const outposts = Array.from(dirMap.entries()).map(([dir, dirWatches]) =>
    analyzeSentinelOutpost(dirWatches, dir),
  )

  const avgWatchfulness = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.watchfulness, 0) / watches.length) : 0
  const avgResponse = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.lightningResponse, 0) / watches.length) : 0
  const avgVigilance = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.guardianVigilance, 0) / watches.length) : 0

  const overallProtection = watches.length > 0
    ? Math.round((avgWatchfulness + avgResponse + avgVigilance) / 3) : 0
  const isVigilant = avgWatchfulness >= 60

  const network: StormNetwork = { avgWatchfulness, avgResponse, avgVigilance, isVigilant, overallProtection }

  const avgStormWarning = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.stormWarning, 0) / watches.length) : 0
  const avgLightningResponse = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.lightningResponse, 0) / watches.length) : 0
  const avgThunderResilience = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.thunderResilience, 0) / watches.length) : 0
  const avgGuardianVigilance = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.guardianVigilance, 0) / watches.length) : 0

  const bestWatch = watches.length > 0
    ? watches.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file : ''
  const mostWatchful = watches.length > 0
    ? watches.reduce((best, w) => w.watchfulness > best.watchfulness ? w : best).file : ''
  const bestWarning = watches.length > 0
    ? watches.reduce((best, w) => w.stormWarning > best.stormWarning ? w : best).file : ''
  const fastestResponse = watches.length > 0
    ? watches.reduce((best, w) => w.lightningResponse > best.lightningResponse ? w : best).file : ''
  const mostVigilant = watches.length > 0
    ? watches.reduce((best, w) => w.guardianVigilance > best.guardianVigilance ? w : best).file : ''

  const stats: StormSentinelStats = {
    totalFiles: watches.length,
    totalOutposts: outposts.length,
    avgWatchfulness,
    avgStormWarning,
    avgLightningResponse,
    avgThunderResilience,
    avgGuardianVigilance,
    perfectSentinelCount: watches.filter(w => w.condition === 'perfect-sentinel').length,
    stormTowerCount: watches.filter(w => w.condition === 'storm-tower').length,
    properWatchtowerCount: watches.filter(w => w.condition === 'proper-watchtower').length,
    weatheredPostCount: watches.filter(w => w.condition === 'weathered-post').length,
    fallenTowerCount: watches.filter(w => w.condition === 'fallen-tower').length,
    rubbleCount: watches.filter(w => w.condition === 'rubble').length,
    hasHighWatchCount: watches.filter(w => w.observing.hasHighWatch).length,
    hasHighWarningCount: watches.filter(w => w.warning.hasHighWarning).length,
    hasHighResponseCount: watches.filter(w => w.responding.hasHighResponse).length,
    hasHighResilienceCount: watches.filter(w => w.enduring.hasHighResilience).length,
    hasHighVigilanceCount: watches.filter(w => w.guarding.hasHighVigilance).length,
    overallProtection,
    commanderGrade: classifyCommanderGrade(overallProtection),
    bestWatch, mostWatchful, bestWarning, fastestResponse, mostVigilant,
  }

  const recommendations = generateRecommendations(watches, outposts, network, stats)

  return { watches, outposts, network, stats, recommendations }
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
