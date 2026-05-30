// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Stone = 'obsidian-hard' | 'granite-solid' | 'proper-rock' | 'sandstone-soft' | 'crumbling-clay' | 'no-resilience'
export type Rebirth = 'perfect-resurrection' | 'strong-recovery' | 'proper-healing' | 'weak-revival' | 'no-recovery' | 'no-rebirth'
export type Ash = 'ancient-ashes' | 'wise-remnants' | 'proper-insight' | 'flickering-memory' | 'scattered-dust' | 'no-wisdom'
export type Flame = 'surgical-fire' | 'precise-burn' | 'proper-flame' | 'wildfire' | 'dying-spark' | 'no-flame'
export type Ember = 'eternal-glow' | 'bright-ember' | 'proper-heat' | 'fading-coal' | 'cold-ash' | 'no-vitality'
export type FeatherCondition = 'immortal-phoenix' | 'rising-bird' | 'proper-firebird' | 'wounded-falcon' | 'fallen-bird' | 'ash'
export type NestType = 'eternal-nest' | 'phoenix-roost' | 'proper-perch' | 'small-nest' | 'ground-scrape' | 'no-nest'
export type NestCondition = 'phoenix-sanctuary' | 'rising-colony' | 'proper-flock' | 'scattered-feathers' | 'burned-ground' | 'void'
export type KeeperGrade = 'phoenix-lord' | 'fire-keeper' | 'ash-guardian' | 'apprentice' | 'novice' | 'smoker'

export interface EnduringMeasure {
  resilience: number
  stone: Stone
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasBattleTested: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface RegeneratingMeasure {
  quality: number
  rebirth: Rebirth
  hasHighQuality: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasSelfHealing: boolean
  hasNoFatalCrash: boolean
  hasRetryLogic: boolean
  hasNoSingleAttempt: boolean
  hasFallback: boolean
  hasNoSinglePath: boolean
  hasRecoverable: boolean
  hasNoPermanentFailure: boolean
  hasResilient: boolean
  hasNoBrittle: boolean
  hasAdaptive: boolean
  harshFailCount: number
  singleAttemptCount: number
}

export interface LearningMeasure {
  wisdom: number
  ash: Ash
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasBoundaryChecked: boolean
  hasNoAssumed: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  undocumentedCount: number
  assumedCount: number
}

export interface BurningMeasure {
  precision: number
  flame: Flame
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasTargeted: boolean
  hasNoScattered: boolean
  approximateCount: number
  sloppyCount: number
}

export interface GlowingMeasure {
  vitality: number
  ember: Ember
  hasHighVitality: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasActive: boolean
  hasNoDormant: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasVibrant: boolean
  hasNoLifeless: boolean
  hasDynamic: boolean
  abandonedCount: number
  stagnantCount: number
}

export interface OnyxFeather {
  file: string
  darkResilience: number
  rebirthQuality: number
  ashWisdom: number
  flamePrecision: number
  emberVitality: number
  enduring: EnduringMeasure
  regenerating: RegeneratingMeasure
  learning: LearningMeasure
  burning: BurningMeasure
  glowing: GlowingMeasure
  condition: FeatherCondition
  qualityScore: number
}

export interface OnyxNest {
  directory: string
  feathers: OnyxFeather[]
  avgResilience: number
  avgRebirth: number
  avgWisdom: number
  immortalPhoenixCount: number
  ashCount: number
  nestType: NestType
  condition: NestCondition
}

export interface OnyxPhoenixResult {
  feathers: OnyxFeather[]
  nests: OnyxNest[]
  flight: {
    avgResilience: number
    avgRebirth: number
    avgWisdom: number
    isImmortal: boolean
    overallRebirth: number
  }
  stats: {
    totalFiles: number
    totalNests: number
    avgDarkResilience: number
    avgRebirthQuality: number
    avgAshWisdom: number
    avgFlamePrecision: number
    avgEmberVitality: number
    immortalPhoenixCount: number
    risingBirdCount: number
    properFirebirdCount: number
    woundedFalconCount: number
    fallenBirdCount: number
    ashCount: number
    hasHighResilienceCount: number
    hasHighRebirthCount: number
    hasHighWisdomCount: number
    hasHighPrecisionCount: number
    hasHighVitalityCount: number
    overallRebirth: number
    keeperGrade: KeeperGrade
    bestFeather: string
    mostResilient: string
    bestRebirth: string
    wisest: string
    mostPrecise: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('try { await work() } catch (e) { handleError(e) }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasTryCatch) score += 8
  if (hasThrow) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    resilience,
    stone: classifyStone(resilience),
    hasHighResilience: resilience >= 80,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval,
    hasTested: hasTryCatch || hasThrow,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasDefensive: hasOptional || hasNullish,
    hasNoNaive: !hasDebugger,
    hasRobust: hasTryCatch && hasReturnType,
    hasNoFragile: hasVar === 0 && !hasEval,
    hasRecoverable: hasTryCatch || hasNullish,
    hasNoFatal: !hasEval && !hasDebugger,
    hasBattleTested: hasTryCatch && hasExport && !hasAny,
    bareCrashCount,
    untestedCount,
  }
}

// ─── measureRegenerating ───────────────────────────────────────────

/**
 * @example measureRegenerating('try { work() } catch (e) { return fallback ?? "default" }')
 */
export function measureRegenerating(content: string): RegeneratingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasCatch = hasPattern(content, /\bcatch\b/)
  const hasFinally = hasPattern(content, /\bfinally\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasDefault = hasPattern(content, /\|\|[^=]/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasTryCatch) score += 8
  if (hasCatch) score += 4
  if (hasFinally) score += 6
  if (hasOptional) score += 6
  if (hasNullish) score += 6
  if (hasOptionalChain) score += 4
  if (hasDefault) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4

  const quality = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const harshFailCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)
  const singleAttemptCount = hasVar > 0 ? 1 : 0

  return {
    quality,
    rebirth: classifyRebirth(quality),
    hasHighQuality: quality >= 80,
    hasGraceful: hasTryCatch && (hasNullish || hasOptional),
    hasNoHarshFail: !hasEval,
    hasSelfHealing: hasTryCatch && hasNullish && hasOptional,
    hasNoFatalCrash: !hasEval && !hasDebugger,
    hasRetryLogic: hasTryCatch || hasAsync,
    hasNoSingleAttempt: hasOptional || hasNullish,
    hasFallback: hasNullish || hasDefault,
    hasNoSinglePath: hasOptional || hasNullish,
    hasRecoverable: hasTryCatch || hasNullish,
    hasNoPermanentFailure: !hasEval,
    hasResilient: hasTryCatch && hasExport,
    hasNoBrittle: hasVar === 0 && !hasEval,
    hasAdaptive: hasOptional && hasGenerics,
    harshFailCount,
    singleAttemptCount,
  }
}

// ─── measureLearning ───────────────────────────────────────────────

/**
 * @example measureLearning('/** docs *\\/ export interface Processor<T> { process(input: T): T }')
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasGenerics) score += 6
  if (hasTryCatch) score += 4
  if (hasOptional) score += 4
  if (hasReturnType) score += 4
  if (hasConst) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasAny) score -= 4

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const undocumentedCount = hasVar > 0 ? 1 : 0
  const assumedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    wisdom,
    ash: classifyAsh(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellCommented: hasDoc && hasExport,
    hasNoUndocumented: hasVar === 0,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval,
    hasEdgeCaseCovered: hasOptional || hasEnum,
    hasNoSinglePath: hasOptional,
    hasBoundaryChecked: hasEnum || hasReturnType,
    hasNoAssumed: !hasAny && !hasEval,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoHacky: hasHackyCast === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    undocumentedCount,
    assumedCount,
  }
}

// ─── measureBurning ────────────────────────────────────────────────

/**
 * @example measureBurning('export function precise(x: string): string { return x.trim() }')
 */
export function measureBurning(content: string): BurningMeasure {
  let score = 0

  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasOptional) score += 4
  if (hasExport) score += 4
  if (hasNamed) score += 4
  if (hasDoc) score += 6
  if (hasEnum) score += 4
  if (hasType) score += 4
  if (hasPrivate) score += 4
  if (hasPipeline) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)
  if (hasAny) score -= 6

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const approximateCount = hasVar > 0 ? 1 : 0
  const sloppyCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    precision,
    flame: classifyFlame(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType && hasTypeAnnotation,
    hasAccurate: hasInterface && hasGenerics,
    hasNoApproximate: hasVar === 0,
    hasCorrect: hasReadonly && !hasAny,
    hasNoAlmostRight: hasVar === 0 && !hasEval,
    hasSharp: hasReturnType && !hasAny,
    hasNoSloppy: !hasDebugger && !hasEval,
    hasPrecise: hasReadonly && hasOptional,
    hasNoVague: !hasAny,
    hasDefined: hasInterface || hasType,
    hasNoFuzzy: !hasAny && !hasEval,
    hasTargeted: hasNamed && hasReturnType,
    hasNoScattered: !hasDebugger && hasVar === 0,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureGlowing ────────────────────────────────────────────────

/**
 * @example measureGlowing('export function live(): string { return "active" }')
 */
export function measureGlowing(content: string): GlowingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasImport) score += 4
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasArrow) score += 4
  if (hasConst) score += 4
  if (hasPipeline) score += 4
  if (hasGenerics) score += 4
  if (hasDoc) score += 4
  if (hasInterface) score += 4
  if (hasReturnType) score += 4
  if (hasOptional) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasTodo) score -= 5
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4

  const vitality = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const abandonedCount = hasTodo ? 1 : 0
  const stagnantCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    vitality,
    ember: classifyEmber(vitality),
    hasHighVitality: vitality >= 80,
    hasMaintained: hasExport && !hasTodo,
    hasNoAbandoned: !hasTodo,
    hasActive: hasExport && hasImport,
    hasNoDormant: !hasTodo && !hasDebugger,
    hasFresh: hasAsync || hasArrow,
    hasNoStale: hasVar === 0,
    hasAlive: hasNamed && hasConst,
    hasNoDead: !hasDebugger && !hasAny,
    hasEvolving: hasGenerics && hasAsync,
    hasNoStagnant: !hasVar && !hasTodo,
    hasVibrant: hasPipeline && hasArrow,
    hasNoLifeless: !hasDebugger && !hasAny && !hasTodo,
    hasDynamic: hasAsync && hasPipeline,
    abandonedCount,
    stagnantCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyStone(resilience: number): Stone {
  if (resilience >= 90) return 'obsidian-hard'
  if (resilience >= 75) return 'granite-solid'
  if (resilience >= 60) return 'proper-rock'
  if (resilience >= 40) return 'sandstone-soft'
  if (resilience >= 20) return 'crumbling-clay'
  return 'no-resilience'
}

function classifyRebirth(quality: number): Rebirth {
  if (quality >= 90) return 'perfect-resurrection'
  if (quality >= 75) return 'strong-recovery'
  if (quality >= 60) return 'proper-healing'
  if (quality >= 40) return 'weak-revival'
  if (quality >= 20) return 'no-recovery'
  return 'no-rebirth'
}

function classifyAsh(wisdom: number): Ash {
  if (wisdom >= 90) return 'ancient-ashes'
  if (wisdom >= 75) return 'wise-remnants'
  if (wisdom >= 60) return 'proper-insight'
  if (wisdom >= 40) return 'flickering-memory'
  if (wisdom >= 20) return 'scattered-dust'
  return 'no-wisdom'
}

function classifyFlame(precision: number): Flame {
  if (precision >= 90) return 'surgical-fire'
  if (precision >= 75) return 'precise-burn'
  if (precision >= 60) return 'proper-flame'
  if (precision >= 40) return 'wildfire'
  if (precision >= 20) return 'dying-spark'
  return 'no-flame'
}

function classifyEmber(vitality: number): Ember {
  if (vitality >= 90) return 'eternal-glow'
  if (vitality >= 75) return 'bright-ember'
  if (vitality >= 60) return 'proper-heat'
  if (vitality >= 40) return 'fading-coal'
  if (vitality >= 20) return 'cold-ash'
  return 'no-vitality'
}

export function classifyFeatherCondition(qualityScore: number): FeatherCondition {
  if (qualityScore >= 90) return 'immortal-phoenix'
  if (qualityScore >= 75) return 'rising-bird'
  if (qualityScore >= 60) return 'proper-firebird'
  if (qualityScore >= 40) return 'wounded-falcon'
  if (qualityScore >= 20) return 'fallen-bird'
  return 'ash'
}

export function classifyNestType(feathers: OnyxFeather[]): NestType {
  if (feathers.length === 0) return 'no-nest'
  const avgQs = feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  const immortalRatio = feathers.filter(f => f.condition === 'immortal-phoenix').length / feathers.length
  if (avgQs >= 85 && immortalRatio >= 0.5) return 'eternal-nest'
  if (avgQs >= 70 && immortalRatio >= 0.3) return 'phoenix-roost'
  if (avgQs >= 55) return 'proper-perch'
  if (avgQs >= 35) return 'small-nest'
  if (avgQs >= 15) return 'ground-scrape'
  return 'no-nest'
}

export function classifyNestCondition(avgResilience: number): NestCondition {
  if (avgResilience >= 85) return 'phoenix-sanctuary'
  if (avgResilience >= 70) return 'rising-colony'
  if (avgResilience >= 55) return 'proper-flock'
  if (avgResilience >= 35) return 'scattered-feathers'
  if (avgResilience >= 15) return 'burned-ground'
  return 'void'
}

export function classifyKeeperGrade(avgRebirth: number): KeeperGrade {
  if (avgRebirth >= 85) return 'phoenix-lord'
  if (avgRebirth >= 70) return 'fire-keeper'
  if (avgRebirth >= 55) return 'ash-guardian'
  if (avgRebirth >= 40) return 'apprentice'
  if (avgRebirth >= 20) return 'novice'
  return 'smoker'
}

// ─── analyzeOnyxFeather ────────────────────────────────────────────

/**
 * @example analyzeOnyxFeather(content, 'src/foo.ts')
 */
export function analyzeOnyxFeather(content: string, filePath: string): OnyxFeather {
  const enduring = measureEnduring(content)
  const regenerating = measureRegenerating(content)
  const learning = measureLearning(content)
  const burning = measureBurning(content)
  const glowing = measureGlowing(content)

  const darkResilience = enduring.resilience
  const rebirthQuality = regenerating.quality
  const ashWisdom = learning.wisdom
  const flamePrecision = burning.precision
  const emberVitality = glowing.vitality

  const qualityScore = Math.round(
    darkResilience * 0.2 +
    rebirthQuality * 0.2 +
    ashWisdom * 0.2 +
    flamePrecision * 0.2 +
    emberVitality * 0.2,
  )

  return {
    file: filePath,
    darkResilience,
    rebirthQuality,
    ashWisdom,
    flamePrecision,
    emberVitality,
    enduring,
    regenerating,
    learning,
    burning,
    glowing,
    condition: classifyFeatherCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeOnyxNest ───────────────────────────────────────────────

/**
 * @example analyzeOnyxNest(feathers, 'src')
 */
export function analyzeOnyxNest(feathers: OnyxFeather[], dirPath: string): OnyxNest {
  if (feathers.length === 0) {
    return {
      directory: dirPath,
      feathers: [],
      avgResilience: 0,
      avgRebirth: 0,
      avgWisdom: 0,
      immortalPhoenixCount: 0,
      ashCount: 0,
      nestType: 'no-nest',
      condition: 'void',
    }
  }

  const avgResilience = Math.round(feathers.reduce((s, f) => s + f.darkResilience, 0) / feathers.length)
  const avgRebirth = Math.round(feathers.reduce((s, f) => s + f.rebirthQuality, 0) / feathers.length)
  const avgWisdom = Math.round(feathers.reduce((s, f) => s + f.ashWisdom, 0) / feathers.length)
  const immortalPhoenixCount = feathers.filter(f => f.condition === 'immortal-phoenix').length
  const ashCount = feathers.filter(f => f.condition === 'ash').length

  return {
    directory: dirPath,
    feathers,
    avgResilience,
    avgRebirth,
    avgWisdom,
    immortalPhoenixCount,
    ashCount,
    nestType: classifyNestType(feathers),
    condition: classifyNestCondition(avgResilience),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(feathers, nests, flight, stats)
 */
export function generateRecommendations(
  feathers: OnyxFeather[],
  nests: OnyxNest[],
  _flight: OnyxPhoenixResult['flight'],
  stats: OnyxPhoenixResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallRebirth >= 85 && stats.ashCount === 0) {
    recs.push('Onyx phoenix perfection — the immortal bird rises eternally from the flames')
    return recs
  }

  if (stats.avgDarkResilience < 60) {
    recs.push('Harden dark resilience — add error handling, type safety, remove eval and debugger')
  }
  if (stats.avgRebirthQuality < 60) {
    recs.push('Improve rebirth quality — add try/catch, nullish coalescing, optional params, remove eval')
  }
  if (stats.avgAshWisdom < 60) {
    recs.push('Grow ash wisdom — add documentation, abstractions, proven patterns, remove eval and TODO')
  }
  if (stats.avgFlamePrecision < 60) {
    recs.push('Sharpen flame precision — add type annotations, generics, readonly, remove var and debugger')
  }
  if (stats.avgEmberVitality < 60) {
    recs.push('Ignite ember vitality — add exports, async/await, pipelines, remove var and TODO')
  }

  if (stats.ashCount > 0) {
    const ashFiles = feathers.filter(f => f.condition === 'ash').map(f => f.file)
    if (ashFiles.length <= 3) {
      recs.push(`Ash detected: ${ashFiles.join(', ')} — these need the phoenix fire`)
    } else {
      recs.push(`${ashFiles.length} ash files detected — they need the phoenix fire`)
    }
  }

  if (nests.length > 1) {
    const burnedNests = nests.filter(n => n.condition === 'scattered-feathers' || n.condition === 'burned-ground')
    if (burnedNests.length > 0) {
      recs.push(`${burnedNests.length} nest(s) have scattered or burned conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The onyx phoenix holds steady — maintain current flame')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildOnyxPhoenixResult ────────────────────────────────────────

/**
 * @example buildOnyxPhoenixResult(['a.ts'], [content])
 */
export async function buildOnyxPhoenixResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxPhoenixResult> {
  const feathers: OnyxFeather[] = files.map((file, i) =>
    analyzeOnyxFeather(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OnyxFeather[]>()
  for (const feather of feathers) {
    const dir = path.dirname(feather.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(feather)
    } else {
      dirMap.set(dir, [feather])
    }
  }

  const nests: OnyxNest[] = Array.from(dirMap.entries()).map(([dir, dirFeathers]) =>
    analyzeOnyxNest(dirFeathers, dir),
  )

  const avgDarkResilience = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.darkResilience, 0) / feathers.length)
    : 0
  const avgRebirthQuality = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.rebirthQuality, 0) / feathers.length)
    : 0
  const avgAshWisdom = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.ashWisdom, 0) / feathers.length)
    : 0
  const avgFlamePrecision = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.flamePrecision, 0) / feathers.length)
    : 0
  const avgEmberVitality = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.emberVitality, 0) / feathers.length)
    : 0

  const overallRebirth = Math.round(
    (avgDarkResilience + avgRebirthQuality + avgAshWisdom) / 3,
  )

  const flight = {
    avgResilience: avgDarkResilience,
    avgRebirth: avgRebirthQuality,
    avgWisdom: avgAshWisdom,
    isImmortal: overallRebirth >= 80,
    overallRebirth,
  }

  const bestFeather = feathers.length > 0
    ? feathers.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file
    : ''
  const mostResilient = feathers.length > 0
    ? feathers.reduce((best, f) => f.darkResilience > best.darkResilience ? f : best).file
    : ''
  const bestRebirth = feathers.length > 0
    ? feathers.reduce((best, f) => f.rebirthQuality > best.rebirthQuality ? f : best).file
    : ''
  const wisest = feathers.length > 0
    ? feathers.reduce((best, f) => f.ashWisdom > best.ashWisdom ? f : best).file
    : ''
  const mostPrecise = feathers.length > 0
    ? feathers.reduce((best, f) => f.flamePrecision > best.flamePrecision ? f : best).file
    : ''

  const stats = {
    totalFiles: feathers.length,
    totalNests: nests.length,
    avgDarkResilience,
    avgRebirthQuality,
    avgAshWisdom,
    avgFlamePrecision,
    avgEmberVitality,
    immortalPhoenixCount: feathers.filter(f => f.condition === 'immortal-phoenix').length,
    risingBirdCount: feathers.filter(f => f.condition === 'rising-bird').length,
    properFirebirdCount: feathers.filter(f => f.condition === 'proper-firebird').length,
    woundedFalconCount: feathers.filter(f => f.condition === 'wounded-falcon').length,
    fallenBirdCount: feathers.filter(f => f.condition === 'fallen-bird').length,
    ashCount: feathers.filter(f => f.condition === 'ash').length,
    hasHighResilienceCount: feathers.filter(f => f.enduring.hasHighResilience).length,
    hasHighRebirthCount: feathers.filter(f => f.regenerating.hasHighQuality).length,
    hasHighWisdomCount: feathers.filter(f => f.learning.hasHighWisdom).length,
    hasHighPrecisionCount: feathers.filter(f => f.burning.hasHighPrecision).length,
    hasHighVitalityCount: feathers.filter(f => f.glowing.hasHighVitality).length,
    overallRebirth,
    keeperGrade: classifyKeeperGrade(overallRebirth),
    bestFeather,
    mostResilient,
    bestRebirth,
    wisest,
    mostPrecise,
  }

  const recommendations = generateRecommendations(feathers, nests, flight, { ...stats, recommendations: [] } as OnyxPhoenixResult['stats'])

  return {
    feathers,
    nests,
    flight,
    stats,
    recommendations,
  }
}
