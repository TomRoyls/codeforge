// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Rebirth quality grade */
export type RebirthGrade =
  | 'divine-rebirth'
  | 'graceful-renewal'
  | 'proper-rebirth'
  | 'struggling-revival'
  | 'failed-resurrection'
  | 'ashes-only'

/** Storm resilience grade */
export type StormGrade =
  | 'impervious-shield'
  | 'storm-proof'
  | 'weather-resistant'
  | 'storm-vulnerable'
  | 'easily-damaged'
  | 'no-protection'

/** Ember wisdom grade */
export type EmberGrade =
  | 'ancient-wisdom'
  | 'experienced-flame'
  | 'proper-glow'
  | 'dying-ember'
  | 'cold-ash'
  | 'no-wisdom'

/** Lightning adaptation grade */
export type LightningGrade =
  | 'lightning-fast'
  | 'quick-adapt'
  | 'proper-flex'
  | 'slow-response'
  | 'rigid-body'
  | 'petrified'

/** Ash transformation grade */
export type AshGrade =
  | 'phoenix-ascension'
  | 'ash-to-beauty'
  | 'proper-transform'
  | 'partial-conversion'
  | 'wasted-ash'
  | 'no-transformation'

/** Phoenix condition */
export type PhoenixCondition =
  | 'mythical-phoenix'
  | 'soaring-bird'
  | 'proper-fledgling'
  | 'wounded-bird'
  | 'fallen-phoenix'
  | 'egg'

/** Flock type */
export type FlockType =
  | 'eternal-flock'
  | 'storm-riders'
  | 'proper-flock'
  | 'scattered-feathers'
  | 'fallen-flock'
  | 'no-flock'

/** Flock condition */
export type FlockCondition =
  | 'legendary-sky'
  | 'storm-survivors'
  | 'decent-flight'
  | 'grounded'
  | 'extinguished'
  | 'void'

/** Aviator grade */
export type AviatorGrade =
  | 'phoenix-lord'
  | 'storm-rider'
  | 'skilled-flyer'
  | 'apprentice'
  | 'novice'
  | 'flightless'

/** Rebirthing measurement */
export interface RebirthingMeasure {
  quality: number
  grade: RebirthGrade
  hasHighQuality: boolean
  hasRefactorable: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasDecoupled: boolean
  hasNoTangled: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasClean: boolean
  hasNoSpaghetti: boolean
  hasRenewable: boolean
  monolithicCount: number
  tangledCount: number
}

/** Weathering measurement */
export interface WeatheringMeasure {
  resilience: number
  storm: StormGrade
  hasHighResilience: boolean
  hasTryCatch: boolean
  hasErrorBoundary: boolean
  hasNoBareThrow: boolean
  hasValidation: boolean
  hasNoUnchecked: boolean
  hasGraceful: boolean
  hasNoSilent: boolean
  hasRecovery: boolean
  hasNoCrash: boolean
  hasFallback: boolean
  bareThrowCount: number
  uncheckedCount: number
}

/** Learning measurement */
export interface LearningMeasure {
  wisdom: number
  ember: EmberGrade
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasCommented: boolean
  hasNoUndocumented: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasLogged: boolean
  hasNoUnlogged: boolean
  hasVersioned: boolean
  undocumentedCount: number
  untypedCount: number
}

/** Adapting measurement */
export interface AdaptingMeasure {
  adaptation: number
  lightning: LightningGrade
  hasHighAdaptation: boolean
  hasFlexible: boolean
  hasConfigurable: boolean
  hasNoHardcoded: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasPluggable: boolean
  hasNoFixed: boolean
  hasPortable: boolean
  hasNoPlatformLocked: boolean
  hasScalable: boolean
  hardcodedCount: number
  staticCount: number
}

/** Transforming measurement */
export interface TransformingMeasure {
  transformation: number
  ash: AshGrade
  hasHighTransformation: boolean
  hasLearningFromErrors: boolean
  hasRetryLogic: boolean
  hasNoSwallowed: boolean
  hasImprovement: boolean
  hasNoStagnation: boolean
  hasEvolution: boolean
  hasNoRegression: boolean
  hasGrowth: boolean
  hasNoDecline: boolean
  hasProgression: boolean
  swallowedCount: number
  stagnationCount: number
}

/** Single file analysis */
export interface PhoenixEmber {
  file: string
  rebirthQuality: number
  stormResilience: number
  emberWisdom: number
  lightningAdaptation: number
  ashTransformation: number
  rebirthing: RebirthingMeasure
  weathering: WeatheringMeasure
  learning: LearningMeasure
  adapting: AdaptingMeasure
  transforming: TransformingMeasure
  condition: PhoenixCondition
  qualityScore: number
}

/** Directory-level flock */
export interface PhoenixFlock {
  directory: string
  embers: PhoenixEmber[]
  avgRebirth: number
  avgResilience: number
  avgAdaptation: number
  mythicalPhoenixCount: number
  eggCount: number
  flockType: FlockType
  condition: FlockCondition
}

/** Storm summary */
export interface StormSummary {
  avgRebirth: number
  avgResilience: number
  avgAdaptation: number
  isLegendary: boolean
  overallPower: number
}

/** Full stats */
export interface StormPhoenixStats {
  totalFiles: number
  totalFlocks: number
  avgRebirthQuality: number
  avgStormResilience: number
  avgEmberWisdom: number
  avgLightningAdaptation: number
  avgAshTransformation: number
  mythicalPhoenixCount: number
  soaringBirdCount: number
  properFledglingCount: number
  woundedBirdCount: number
  fallenPhoenixCount: number
  eggCount: number
  hasHighQualityCount: number
  hasHighResilienceCount: number
  hasHighWisdomCount: number
  hasHighAdaptationCount: number
  hasHighTransformationCount: number
  overallPower: number
  aviatorGrade: AviatorGrade
  bestEmber: string
  bestRebirth: string
  mostResilient: string
  wisest: string
  mostAdaptive: string
}

/** Full result */
export interface StormPhoenixResult {
  embers: PhoenixEmber[]
  flocks: PhoenixFlock[]
  storm: StormSummary
  stats: StormPhoenixStats
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
const hasCatch = (c: string) => has(/\bcatch\b/, c)
const hasFinally = (c: string) => has(/\bfinally\b/, c)
const hasErrorNew = (c: string) => has(/new\s+Error\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure rebirth quality
 * @example
 * const m = measureRebirthing(content)
 * console.log(m.grade) // 'divine-rebirth'
 */
export function measureRebirthing(content: string): RebirthingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasRefactorable = hasExport(content) && hasConst(content)
  const hasModular = hasReturnType(content) && hasInterface(content)
  const hasDecoupled = hasImport(content) && hasNamedExport(content)
  const hasExtensible = hasAsync(content) && hasGenerics(content)
  const hasClean = hasDocComments(content) && hasExport(content)
  const hasRenewable = hasTypeAlias(content) && hasConst(content)

  score += hasRefactorable ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasDecoupled ? 5 : 0
  score += hasExtensible ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasRenewable ? 5 : 0

  const quality = Math.min(score, 100)
  const monolithicCount = countMatches(/\bvar\b/, content)
  const tangledCount = countMatches(/\bany\b/, content)

  const hasNoMonolithic = monolithicCount === 0
  const hasNoTangled = tangledCount === 0
  const hasNoRigid = !has(/\beval\b/, content)
  const hasNoSpaghetti = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: RebirthGrade
  if (quality >= 85) grade = 'divine-rebirth'
  else if (quality >= 70) grade = 'graceful-renewal'
  else if (quality >= 55) grade = 'proper-rebirth'
  else if (quality >= 40) grade = 'struggling-revival'
  else if (quality >= 25) grade = 'failed-resurrection'
  else grade = 'ashes-only'

  return {
    quality, grade, hasHighQuality, hasRefactorable, hasModular, hasNoMonolithic,
    hasDecoupled, hasNoTangled, hasExtensible, hasNoRigid, hasClean, hasNoSpaghetti,
    hasRenewable, monolithicCount, tangledCount,
  }
}

/**
 * Measure storm resilience
 * @example
 * const m = measureWeathering(content)
 * console.log(m.storm) // 'impervious-shield'
 */
export function measureWeathering(content: string): WeatheringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 15 : 0
  score += hasCatch(content) ? 10 : 0
  score += hasFinally(content) ? 10 : 0
  score += hasErrorNew(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 7 : 0

  const hasTryCatchVal = hasTryCatch(content) && hasCatch(content)
  const hasErrorBoundary = hasTryCatch(content) && hasErrorNew(content)
  const hasValidation = hasReturnType(content) && hasStrictEq(content)
  const hasGraceful = hasFinally(content) || hasNullishCoalescing(content)
  const hasRecovery = hasTryCatch(content) && hasReturnType(content)
  const hasFallback = hasNullishCoalescing(content) || hasOptional(content)

  score += hasTryCatchVal ? 5 : 0
  score += hasErrorBoundary ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasRecovery ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareThrowCount = countMatches(/\bthrow\b/, content)
  const uncheckedCount = countMatches(/\bany\b/, content)

  const hasNoBareThrow = bareThrowCount === 0 || hasErrorNew(content)
  const hasNoUnchecked = uncheckedCount === 0
  const hasNoSilent = !has(/\bdebugger\b/, content)
  const hasNoCrash = !has(/\beval\b/, content)
  const hasHighResilience = resilience >= 70

  let storm: StormGrade
  if (resilience >= 85) storm = 'impervious-shield'
  else if (resilience >= 70) storm = 'storm-proof'
  else if (resilience >= 55) storm = 'weather-resistant'
  else if (resilience >= 40) storm = 'storm-vulnerable'
  else if (resilience >= 25) storm = 'easily-damaged'
  else storm = 'no-protection'

  return {
    resilience, storm, hasHighResilience, hasTryCatch: hasTryCatchVal, hasErrorBoundary,
    hasNoBareThrow, hasValidation, hasNoUnchecked, hasGraceful, hasNoSilent,
    hasRecovery, hasNoCrash, hasFallback, bareThrowCount, uncheckedCount,
  }
}

/**
 * Measure ember wisdom
 * @example
 * const m = measureLearning(content)
 * console.log(m.ember) // 'ancient-wisdom'
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0
  score += hasDocComments(content) ? 15 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasStrictEq(content) ? 7 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasCommented = hasDocComments(content) && hasReturnType(content)
  const hasTyped = hasInterface(content) && hasReturnType(content)
  const hasTested = hasExport(content) && hasConst(content)
  const hasLogged = hasImport(content) && hasConst(content)
  const hasVersioned = hasReadonly(content) && hasPrivate(content)

  score += hasDocumented ? 5 : 0
  score += hasCommented ? 5 : 0
  score += hasTyped ? 5 : 0
  score += hasTested ? 5 : 0

  const wisdom = Math.min(score, 100)
  const undocumentedCount = countMatches(/\bvar\b/, content)
  const untypedCount = countMatches(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoUntyped = untypedCount === 0
  const hasNoUntested = !has(/\beval\b/, content)
  const hasNoUnlogged = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let ember: EmberGrade
  if (wisdom >= 85) ember = 'ancient-wisdom'
  else if (wisdom >= 70) ember = 'experienced-flame'
  else if (wisdom >= 55) ember = 'proper-glow'
  else if (wisdom >= 40) ember = 'dying-ember'
  else if (wisdom >= 25) ember = 'cold-ash'
  else ember = 'no-wisdom'

  return {
    wisdom, ember, hasHighWisdom, hasDocumented, hasCommented, hasNoUndocumented,
    hasTyped, hasNoUntyped, hasTested, hasNoUntested, hasLogged, hasNoUnlogged,
    hasVersioned, undocumentedCount, untypedCount,
  }
}

/**
 * Measure lightning adaptation
 * @example
 * const m = measureAdapting(content)
 * console.log(m.lightning) // 'lightning-fast'
 */
export function measureAdapting(content: string): AdaptingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasFlexible = hasExport(content) && hasImport(content)
  const hasConfigurable = hasConst(content) && hasInterface(content)
  const hasDynamic = hasAsync(content) && hasGenerics(content)
  const hasPluggable = hasClass(content) && hasInterface(content)
  const hasPortable = hasReturnType(content) && hasReadonly(content)
  const hasScalable = hasPrivate(content) && hasDocComments(content)

  score += hasFlexible ? 5 : 0
  score += hasConfigurable ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasPluggable ? 5 : 0
  score += hasPortable ? 5 : 0
  score += hasScalable ? 5 : 0

  const adaptation = Math.min(score, 100)
  const hardcodedCount = countMatches(/\bvar\b/, content)
  const staticCount = countMatches(/\bany\b/, content)

  const hasNoHardcoded = hardcodedCount === 0
  const hasNoStatic = staticCount === 0
  const hasNoFixed = !has(/\beval\b/, content)
  const hasNoPlatformLocked = !has(/\bdebugger\b/, content)
  const hasHighAdaptation = adaptation >= 70

  let lightning: LightningGrade
  if (adaptation >= 85) lightning = 'lightning-fast'
  else if (adaptation >= 70) lightning = 'quick-adapt'
  else if (adaptation >= 55) lightning = 'proper-flex'
  else if (adaptation >= 40) lightning = 'slow-response'
  else if (adaptation >= 25) lightning = 'rigid-body'
  else lightning = 'petrified'

  return {
    adaptation, lightning, hasHighAdaptation, hasFlexible, hasConfigurable, hasNoHardcoded,
    hasDynamic, hasNoStatic, hasPluggable, hasNoFixed, hasPortable, hasNoPlatformLocked,
    hasScalable, hardcodedCount, staticCount,
  }
}

/**
 * Measure ash transformation
 * @example
 * const m = measureTransforming(content)
 * console.log(m.ash) // 'phoenix-ascension'
 */
export function measureTransforming(content: string): TransformingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 15 : 0
  score += hasCatch(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasConst(content) ? 9 : 0

  const hasLearningFromErrors = hasTryCatch(content) && hasCatch(content)
  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasImprovement = hasExport(content) && hasImport(content)
  const hasEvolution = hasReturnType(content) && hasInterface(content)
  const hasGrowth = hasGenerics(content) && hasDocComments(content)
  const hasProgression = hasNullishCoalescing(content) && hasConst(content)

  score += hasLearningFromErrors ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasImprovement ? 5 : 0
  score += hasEvolution ? 5 : 0
  score += hasGrowth ? 5 : 0
  score += hasProgression ? 5 : 0

  const transformation = Math.min(score, 100)
  const swallowedCount = countMatches(/\bvar\b/, content)
  const stagnationCount = countMatches(/\bany\b/, content)

  const hasNoSwallowed = swallowedCount === 0
  const hasNoStagnation = stagnationCount === 0
  const hasNoRegression = !has(/\beval\b/, content)
  const hasNoDecline = !has(/\bdebugger\b/, content)
  const hasHighTransformation = transformation >= 70

  let ash: AshGrade
  if (transformation >= 85) ash = 'phoenix-ascension'
  else if (transformation >= 70) ash = 'ash-to-beauty'
  else if (transformation >= 55) ash = 'proper-transform'
  else if (transformation >= 40) ash = 'partial-conversion'
  else if (transformation >= 25) ash = 'wasted-ash'
  else ash = 'no-transformation'

  return {
    transformation, ash, hasHighTransformation, hasLearningFromErrors, hasRetryLogic,
    hasNoSwallowed, hasImprovement, hasNoStagnation, hasEvolution, hasNoRegression,
    hasGrowth, hasNoDecline, hasProgression, swallowedCount, stagnationCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify phoenix condition
 * @example
 * classifyPhoenixCondition(90) // 'mythical-phoenix'
 */
export function classifyPhoenixCondition(score: number): PhoenixCondition {
  if (score >= 85) return 'mythical-phoenix'
  if (score >= 70) return 'soaring-bird'
  if (score >= 55) return 'proper-fledgling'
  if (score >= 40) return 'wounded-bird'
  if (score >= 25) return 'fallen-phoenix'
  return 'egg'
}

/**
 * Classify flock type
 * @example
 * classifyFlockType(embers) // 'eternal-flock'
 */
export function classifyFlockType(embers: PhoenixEmber[]): FlockType {
  if (embers.length === 0) return 'no-flock'
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)
  const mythicalRatio = embers.filter(e => e.condition === 'mythical-phoenix').length / embers.length
  if (avgQs >= 75 && mythicalRatio >= 0.5) return 'eternal-flock'
  if (avgQs >= 60) return 'storm-riders'
  if (avgQs >= 45) return 'proper-flock'
  if (avgQs >= 30) return 'scattered-feathers'
  if (avgQs >= 15) return 'fallen-flock'
  return 'no-flock'
}

/**
 * Classify flock condition
 * @example
 * classifyFlockCondition(80) // 'legendary-sky'
 */
export function classifyFlockCondition(avgQs: number): FlockCondition {
  if (avgQs >= 75) return 'legendary-sky'
  if (avgQs >= 60) return 'storm-survivors'
  if (avgQs >= 45) return 'decent-flight'
  if (avgQs >= 30) return 'grounded'
  if (avgQs >= 15) return 'extinguished'
  return 'void'
}

/**
 * Classify aviator grade
 * @example
 * classifyAviatorGrade(85) // 'phoenix-lord'
 */
export function classifyAviatorGrade(avgPower: number): AviatorGrade {
  if (avgPower >= 80) return 'phoenix-lord'
  if (avgPower >= 65) return 'storm-rider'
  if (avgPower >= 50) return 'skilled-flyer'
  if (avgPower >= 35) return 'apprentice'
  if (avgPower >= 20) return 'novice'
  return 'flightless'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(embers, flocks, storm, stats)
 */
export function generateRecommendations(
  embers: PhoenixEmber[],
  flocks: PhoenixFlock[],
  storm: StormSummary,
  stats: StormPhoenixStats,
): string[] {
  const recs: string[] = []
  if (stats.avgRebirthQuality < 50) {
    recs.push('Improve rebirth quality with modular exports, decoupled imports, and extensible async/generics patterns')
  }
  if (stats.avgStormResilience < 50) {
    recs.push('Strengthen storm resilience with try/catch boundaries, typed error handling, and graceful fallback patterns')
  }
  if (stats.avgEmberWisdom < 50) {
    recs.push('Grow ember wisdom with documented interfaces, typed return values, and comprehensive doc comments')
  }
  if (stats.avgLightningAdaptation < 50) {
    recs.push('Boost lightning adaptation with flexible export/import patterns, configurable interfaces, and dynamic generics')
  }
  if (stats.avgAshTransformation < 50) {
    recs.push('Enhance ash transformation with retry logic in try/catch, async error recovery, and progressive improvement')
  }
  if (stats.eggCount > 0) {
    recs.push(`${stats.eggCount} file(s) are still eggs — they need significant quality incubation`)
  }
  if (storm.overallPower < 40) {
    recs.push('Overall storm power is weak — focus on rebirth quality and storm resilience first')
  }
  const allFallen = flocks.every(f => f.flockType === 'no-flock' || f.flockType === 'fallen-flock')
  if (allFallen && flocks.length > 0) {
    recs.push('All flocks have fallen — consider a major quality resurrection')
  }
  const eggFiles = embers.filter(e => e.condition === 'egg').map(e => e.file)
  if (eggFiles.length > 0 && eggFiles.length <= 3) {
    recs.push(`Hatch these egg files into mythical phoenixes: ${eggFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your storm phoenix is phoenix-lord quality! Every ember blazes with legendary power')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as phoenix ember
 * @example
 * const e = analyzePhoenixEmber(content, 'index.ts')
 * console.log(e.condition) // 'mythical-phoenix'
 */
export function analyzePhoenixEmber(content: string, filePath: string): PhoenixEmber {
  const rebirthing = measureRebirthing(content)
  const weathering = measureWeathering(content)
  const learning = measureLearning(content)
  const adapting = measureAdapting(content)
  const transforming = measureTransforming(content)

  const qualityScore = Math.round(
    rebirthing.quality * 0.2 +
    weathering.resilience * 0.2 +
    learning.wisdom * 0.2 +
    adapting.adaptation * 0.2 +
    transforming.transformation * 0.2,
  )

  return {
    file: filePath,
    rebirthQuality: rebirthing.quality,
    stormResilience: weathering.resilience,
    emberWisdom: learning.wisdom,
    lightningAdaptation: adapting.adaptation,
    ashTransformation: transforming.transformation,
    rebirthing,
    weathering,
    learning,
    adapting,
    transforming,
    condition: classifyPhoenixCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as phoenix flock
 * @example
 * const f = analyzePhoenixFlock(embers, 'src')
 * console.log(f.flockType) // 'eternal-flock'
 */
export function analyzePhoenixFlock(embers: PhoenixEmber[], dirPath: string): PhoenixFlock {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [], avgRebirth: 0, avgResilience: 0, avgAdaptation: 0,
      mythicalPhoenixCount: 0, eggCount: 0, flockType: 'no-flock', condition: 'void',
    }
  }

  const avgRebirth = Math.round(embers.reduce((s, e) => s + e.rebirthQuality, 0) / embers.length)
  const avgResilience = Math.round(embers.reduce((s, e) => s + e.stormResilience, 0) / embers.length)
  const avgAdaptation = Math.round(embers.reduce((s, e) => s + e.lightningAdaptation, 0) / embers.length)
  const mythicalPhoenixCount = embers.filter(e => e.condition === 'mythical-phoenix').length
  const eggCount = embers.filter(e => e.condition === 'egg').length
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)

  return {
    directory: dirPath, embers, avgRebirth, avgResilience, avgAdaptation,
    mythicalPhoenixCount, eggCount, flockType: classifyFlockType(embers),
    condition: classifyFlockCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete storm phoenix result
 * @example
 * const result = await buildStormPhoenixResult(files, contents)
 * console.log(result.stats.aviatorGrade) // 'phoenix-lord'
 */
export async function buildStormPhoenixResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StormPhoenixResult> {
  const embers = files.map((file, i) => analyzePhoenixEmber(contents[i] ?? '', file))

  const dirMap = new Map<string, PhoenixEmber[]>()
  for (const ember of embers) {
    const dir = path.dirname(ember.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ember) } else { dirMap.set(dir, [ember]) }
  }

  const flocks = Array.from(dirMap.entries()).map(([dir, dirEmbers]) =>
    analyzePhoenixFlock(dirEmbers, dir),
  )

  const avgRebirth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.rebirthQuality, 0) / embers.length) : 0
  const avgResilience = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.stormResilience, 0) / embers.length) : 0
  const avgAdaptation = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.lightningAdaptation, 0) / embers.length) : 0

  const overallPower = embers.length > 0
    ? Math.round((avgRebirth + avgResilience + avgAdaptation) / 3) : 0
  const isLegendary = avgRebirth >= 60

  const storm: StormSummary = { avgRebirth, avgResilience, avgAdaptation, isLegendary, overallPower }

  const avgEmberWisdom = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.emberWisdom, 0) / embers.length) : 0
  const avgAshTransformation = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.ashTransformation, 0) / embers.length) : 0

  const bestEmber = embers.length > 0
    ? embers.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const bestRebirth = embers.length > 0
    ? embers.reduce((best, e) => e.rebirthQuality > best.rebirthQuality ? e : best).file : ''
  const mostResilient = embers.length > 0
    ? embers.reduce((best, e) => e.stormResilience > best.stormResilience ? e : best).file : ''
  const wisest = embers.length > 0
    ? embers.reduce((best, e) => e.emberWisdom > best.emberWisdom ? e : best).file : ''
  const mostAdaptive = embers.length > 0
    ? embers.reduce((best, e) => e.lightningAdaptation > best.lightningAdaptation ? e : best).file : ''

  const stats: StormPhoenixStats = {
    totalFiles: embers.length,
    totalFlocks: flocks.length,
    avgRebirthQuality: avgRebirth,
    avgStormResilience: avgResilience,
    avgEmberWisdom,
    avgLightningAdaptation: avgAdaptation,
    avgAshTransformation,
    mythicalPhoenixCount: embers.filter(e => e.condition === 'mythical-phoenix').length,
    soaringBirdCount: embers.filter(e => e.condition === 'soaring-bird').length,
    properFledglingCount: embers.filter(e => e.condition === 'proper-fledgling').length,
    woundedBirdCount: embers.filter(e => e.condition === 'wounded-bird').length,
    fallenPhoenixCount: embers.filter(e => e.condition === 'fallen-phoenix').length,
    eggCount: embers.filter(e => e.condition === 'egg').length,
    hasHighQualityCount: embers.filter(e => e.rebirthing.hasHighQuality).length,
    hasHighResilienceCount: embers.filter(e => e.weathering.hasHighResilience).length,
    hasHighWisdomCount: embers.filter(e => e.learning.hasHighWisdom).length,
    hasHighAdaptationCount: embers.filter(e => e.adapting.hasHighAdaptation).length,
    hasHighTransformationCount: embers.filter(e => e.transforming.hasHighTransformation).length,
    overallPower,
    aviatorGrade: classifyAviatorGrade(overallPower),
    bestEmber, bestRebirth, mostResilient, wisest, mostAdaptive,
  }

  const recommendations = generateRecommendations(embers, flocks, storm, stats)

  return { embers, flocks, storm, stats, recommendations }
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
