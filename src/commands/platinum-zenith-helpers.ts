// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PerfectingGrade = 'platinum-peak' | 'golden-summit' | 'proper-peak' | 'foothill-quality' | 'base-camp' | 'no-ascent'
export type ClarifyingPinnacle = 'zenith-clarity' | 'crystal-peak' | 'proper-summit-view' | 'cloudy-height' | 'foggy-ridge' | 'no-view'
export type StrengtheningSummit = 'granite-summit' | 'solid-peak' | 'proper-rock' | 'crumbling-edge' | 'unstable-ledge' | 'no-summit'
export type PrecisioningAltitude = 'atomic-clock' | 'surveyor-grade' | 'proper-measurement' | 'rough-estimate' | 'wild-guess' | 'no-measurement'
export type KnowingZenith = 'omniscient-view' | 'panoramic-wisdom' | 'proper-perspective' | 'tunnel-vision' | 'narrow-view' | 'no-wisdom'
export type PeakCondition = 'platinum-masterpiece' | 'golden-summit' | 'proper-peak' | 'rocky-ridge' | 'gravel-slope' | 'valley-floor'
export type RangeType = 'himalayan-range' | 'alpine-ridge' | 'proper-mountains' | 'rolling-hills' | 'flat-plain' | 'no-range'
export type RangeCondition = 'platinum-summit' | 'golden-peak' | 'decent-mountain' | 'rocky-hill' | 'flatland' | 'void'
export type ClimberGrade = 'mountain-master' | 'expert-alpinist' | 'skilled-climber' | 'apprentice' | 'novice' | 'armchair-mountaineer'

export interface PerfectingMeasure {
  quality: number
  grade: PerfectingGrade
  hasHighQuality: boolean
  hasExcellent: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasMasterful: boolean
  hasNoAmateur: boolean
  hasProduction: boolean
  hasNoPrototype: boolean
  hasPerfect: boolean
  roughCount: number
  crudeCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  pinnacle: ClarifyingPinnacle
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoImpenetrable: boolean
  hasClear: boolean
  hasNoDense: boolean
  hasVisible: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface StrengtheningMeasure {
  resilience: number
  summit: StrengtheningSummit
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasEdgeCaseCovered: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoTrusting: boolean
  hasValidated: boolean
  hasNoUnchecked: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasFortified: boolean
  bareCrashCount: number
  uncheckedCount: number
}

export interface PrecisioningMeasure {
  precision: number
  altitude: PrecisioningAltitude
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  approximateCount: number
  sloppyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  zenith: KnowingZenith
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasDomainAware: boolean
  hasNoContextFree: boolean
  hasPatternBased: boolean
  hasNoAdhoc: boolean
  hasInformed: boolean
  hasNoUninformed: boolean
  hasComprehensive: boolean
  crypticCount: number
  adhocCount: number
}

export interface PlatinumPeak {
  file: string
  peakQuality: number
  pinnacleClarity: number
  summitResilience: number
  altitudePrecision: number
  zenithWisdom: number
  perfecting: PerfectingMeasure
  clarifying: ClarifyingMeasure
  strengthening: StrengtheningMeasure
  precisioning: PrecisioningMeasure
  knowing: KnowingMeasure
  condition: PeakCondition
  qualityScore: number
}

export interface MountainRange {
  directory: string
  peaks: PlatinumPeak[]
  avgQuality: number
  avgClarity: number
  avgWisdom: number
  platinumMasterpieceCount: number
  valleyFloorCount: number
  rangeType: RangeType
  condition: RangeCondition
}

export interface PlatinumExpedition {
  avgQuality: number
  avgClarity: number
  avgWisdom: number
  isSummit: boolean
  overallAltitude: number
}

export interface PlatinumCelebration {
  milestone: 510
  name: 'platinum-zenith'
  message: string
  previousMilestones: number[]
  totalTests: number
}

export interface PlatinumZenithStats {
  totalFiles: number
  totalRanges: number
  avgPeakQuality: number
  avgPinnacleClarity: number
  avgSummitResilience: number
  avgAltitudePrecision: number
  avgZenithWisdom: number
  platinumMasterpieceCount: number
  goldenSummitCount: number
  properPeakCount: number
  rockyRidgeCount: number
  gravelSlopeCount: number
  valleyFloorCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighResilienceCount: number
  hasHighPrecisionCount: number
  hasHighWisdomCount: number
  overallAltitude: number
  climberGrade: ClimberGrade
  bestPeak: string
  highestQuality: string
  clearestView: string
  strongest: string
  wisest: string
}

export interface PlatinumZenithResult {
  peaks: PlatinumPeak[]
  ranges: MountainRange[]
  expedition: PlatinumExpedition
  celebration: PlatinumCelebration
  stats: PlatinumZenithStats
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
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure peak quality (best possible form)
 * @example
 * const m = measurePerfecting(content)
 * console.log(m.grade) // 'platinum-peak'
 */
export function measurePerfecting(content: string): PerfectingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConst(content) ? 4 : 0
  score += hasImport(content) ? 4 : 0
  score += hasUnionType(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasExcellent = hasExport(content) && hasInterface(content) && hasTypeAlias(content)
  const hasPolished = hasNamedExport(content) && hasReturnType(content) && hasGenerics(content)
  const hasRefined = hasDocComments(content) && hasEnum(content) && hasReadonly(content)
  const hasMasterful = hasPrivate(content) && hasClass(content) && hasOptional(content)
  const hasProduction = hasConst(content) && hasImport(content) && hasUnionType(content)
  const hasPerfect = hasAsync(content) && hasExport(content) && hasDocComments(content)

  score += hasExcellent ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasMasterful ? 5 : 0
  score += hasProduction ? 5 : 0
  score += hasPerfect ? 5 : 0

  const quality = Math.min(score, 100)
  const roughCount = countMatches(/\bvar\b/, content)
  const crudeCount = countMatches(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoCrude = crudeCount === 0
  const hasNoAmateur = !has(/\beval\b/, content)
  const hasNoPrototype = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: PerfectingGrade
  if (quality >= 85) grade = 'platinum-peak'
  else if (quality >= 70) grade = 'golden-summit'
  else if (quality >= 55) grade = 'proper-peak'
  else if (quality >= 40) grade = 'foothill-quality'
  else if (quality >= 25) grade = 'base-camp'
  else grade = 'no-ascent'

  return {
    quality, grade, hasHighQuality, hasExcellent, hasPolished,
    hasNoRough, hasRefined, hasNoCrude, hasMasterful, hasNoAmateur,
    hasProduction, hasNoPrototype, hasPerfect, roughCount, crudeCount,
  }
}

/**
 * Measure pinnacle clarity (highest clarity level)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.pinnacle) // 'zenith-clarity'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasReadable = hasDocComments(content) && hasReturnType(content)
  const hasTransparent = hasInterface(content) && hasNamedExport(content)
  const hasSelfDocumenting = hasTypeAlias(content) && hasGenerics(content)
  const hasUnderstandable = hasConst(content) && hasExport(content)
  const hasClear = hasStrictEq(content) && hasOptional(content)
  const hasVisible = hasReadonly(content) && hasEnum(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoImpenetrable = !has(/\beval\b/, content)
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let pinnacle: ClarifyingPinnacle
  if (clarity >= 85) pinnacle = 'zenith-clarity'
  else if (clarity >= 70) pinnacle = 'crystal-peak'
  else if (clarity >= 55) pinnacle = 'proper-summit-view'
  else if (clarity >= 40) pinnacle = 'cloudy-height'
  else if (clarity >= 25) pinnacle = 'foggy-ridge'
  else pinnacle = 'no-view'

  return {
    clarity, pinnacle, hasHighClarity, hasReadable, hasTransparent,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasUnderstandable,
    hasNoImpenetrable, hasClear, hasNoDense, hasVisible,
    obfuscatedCount, crypticCount,
  }
}

/**
 * Measure summit resilience (peak strength)
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.summit) // 'granite-summit'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasErrorHandled = hasStrictEq(content) && hasTryCatch(content)
  const hasEdgeCaseCovered = hasThrow(content) && hasConditional(content)
  const hasDefensive = hasNullishCoalescing(content) && hasReturnType(content)
  const hasValidated = hasInterface(content) && hasOptional(content)
  const hasRobust = hasConst(content) && hasReadonly(content)
  const hasFortified = hasEnum(content) && hasPrivate(content)

  score += hasErrorHandled ? 5 : 0
  score += hasEdgeCaseCovered ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasValidated ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasFortified ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const uncheckedCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoTrusting = !has(/\beval\b/, content)
  const hasNoUnchecked = uncheckedCount === 0
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let summit: StrengtheningSummit
  if (resilience >= 85) summit = 'granite-summit'
  else if (resilience >= 70) summit = 'solid-peak'
  else if (resilience >= 55) summit = 'proper-rock'
  else if (resilience >= 40) summit = 'crumbling-edge'
  else if (resilience >= 25) summit = 'unstable-ledge'
  else summit = 'no-summit'

  return {
    resilience, summit, hasHighResilience, hasErrorHandled, hasEdgeCaseCovered,
    hasNoBareCrash, hasDefensive, hasNoTrusting, hasValidated, hasNoUnchecked,
    hasRobust, hasNoFragile, hasFortified, bareCrashCount, uncheckedCount,
  }
}

/**
 * Measure altitude precision (extreme accuracy)
 * @example
 * const m = measurePrecisioning(content)
 * console.log(m.altitude) // 'atomic-clock'
 */
export function measurePrecisioning(content: string): PrecisioningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0

  const hasExact = hasStrictEq(content) && hasReturnType(content)
  const hasAccurate = hasInterface(content) && hasConst(content)
  const hasPrecise = hasConditional(content) && hasTryCatch(content)
  const hasCorrect = hasThrow(content) && hasEnum(content)
  const hasSharp = hasReadonly(content) && hasOptional(content)
  const hasDefined = hasGenerics(content) && hasNullishCoalescing(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoAlmostRight = sloppyCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let altitude: PrecisioningAltitude
  if (precision >= 85) altitude = 'atomic-clock'
  else if (precision >= 70) altitude = 'surveyor-grade'
  else if (precision >= 55) altitude = 'proper-measurement'
  else if (precision >= 40) altitude = 'rough-estimate'
  else if (precision >= 25) altitude = 'wild-guess'
  else altitude = 'no-measurement'

  return {
    precision, altitude, hasHighPrecision, hasExact, hasAccurate,
    hasNoApproximate, hasPrecise, hasNoVague, hasCorrect, hasNoAlmostRight,
    hasSharp, hasNoSloppy, hasDefined, approximateCount, sloppyCount,
  }
}

/**
 * Measure zenith wisdom (top-level knowledge)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.zenith) // 'omniscient-view'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasWellNamed = hasInterface(content) && hasReturnType(content)
  const hasDomainAware = hasTypeAlias(content) && hasNamedExport(content)
  const hasPatternBased = hasEnum(content) && hasConst(content)
  const hasInformed = hasStrictEq(content) && hasGenerics(content)
  const hasComprehensive = hasAsync(content) && hasPrivate(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasDomainAware ? 5 : 0
  score += hasPatternBased ? 5 : 0
  score += hasInformed ? 5 : 0
  score += hasComprehensive ? 5 : 0

  const wisdom = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const adhocCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoAdhoc = adhocCount === 0
  const hasNoContextFree = !has(/\beval\b/, content)
  const hasNoUninformed = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let zenith: KnowingZenith
  if (wisdom >= 85) zenith = 'omniscient-view'
  else if (wisdom >= 70) zenith = 'panoramic-wisdom'
  else if (wisdom >= 55) zenith = 'proper-perspective'
  else if (wisdom >= 40) zenith = 'tunnel-vision'
  else if (wisdom >= 25) zenith = 'narrow-view'
  else zenith = 'no-wisdom'

  return {
    wisdom, zenith, hasHighWisdom, hasDocumented, hasWellNamed,
    hasNoCryptic, hasDomainAware, hasNoContextFree, hasPatternBased,
    hasNoAdhoc, hasInformed, hasNoUninformed, hasComprehensive,
    crypticCount, adhocCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify peak condition
 * @example
 * classifyPeakCondition(90) // 'platinum-masterpiece'
 */
export function classifyPeakCondition(score: number): PeakCondition {
  if (score >= 85) return 'platinum-masterpiece'
  if (score >= 70) return 'golden-summit'
  if (score >= 55) return 'proper-peak'
  if (score >= 40) return 'rocky-ridge'
  if (score >= 25) return 'gravel-slope'
  return 'valley-floor'
}

/**
 * Classify range type
 * @example
 * classifyRangeType(peaks) // 'himalayan-range'
 */
export function classifyRangeType(peaks: PlatinumPeak[]): RangeType {
  if (peaks.length === 0) return 'no-range'
  const avgQs = Math.round(peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length)
  const masterpieceRatio = peaks.filter(p => p.condition === 'platinum-masterpiece').length / peaks.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'himalayan-range'
  if (avgQs >= 60) return 'alpine-ridge'
  if (avgQs >= 45) return 'proper-mountains'
  if (avgQs >= 30) return 'rolling-hills'
  if (avgQs >= 15) return 'flat-plain'
  return 'no-range'
}

/**
 * Classify range condition
 * @example
 * classifyRangeCondition(80) // 'platinum-summit'
 */
export function classifyRangeCondition(avgQs: number): RangeCondition {
  if (avgQs >= 75) return 'platinum-summit'
  if (avgQs >= 60) return 'golden-peak'
  if (avgQs >= 45) return 'decent-mountain'
  if (avgQs >= 30) return 'rocky-hill'
  if (avgQs >= 15) return 'flatland'
  return 'void'
}

/**
 * Classify climber grade
 * @example
 * classifyClimberGrade(85) // 'mountain-master'
 */
export function classifyClimberGrade(avgAltitude: number): ClimberGrade {
  if (avgAltitude >= 80) return 'mountain-master'
  if (avgAltitude >= 65) return 'expert-alpinist'
  if (avgAltitude >= 50) return 'skilled-climber'
  if (avgAltitude >= 35) return 'apprentice'
  if (avgAltitude >= 20) return 'novice'
  return 'armchair-mountaineer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(peaks, ranges, expedition, stats)
 */
export function generateRecommendations(
  peaks: PlatinumPeak[],
  ranges: MountainRange[],
  expedition: PlatinumExpedition,
  stats: PlatinumZenithStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPeakQuality < 50) {
    recs.push('Elevate peak quality with structured exports, interfaces, and polished type designs')
  }
  if (stats.avgPinnacleClarity < 50) {
    recs.push('Sharpen pinnacle clarity with documentation, self-documenting types, and transparent naming')
  }
  if (stats.avgSummitResilience < 50) {
    recs.push('Fortify summit resilience with error handling, strict equality, and defensive coding')
  }
  if (stats.avgAltitudePrecision < 50) {
    recs.push('Refine altitude precision with exact types, precise equality, and accurate return definitions')
  }
  if (stats.avgZenithWisdom < 50) {
    recs.push('Expand zenith wisdom with documentation, domain-aware types, and pattern-based designs')
  }
  if (stats.valleyFloorCount > 0) {
    recs.push(`${stats.valleyFloorCount} file(s) are at valley floor — they need complete ascent construction`)
  }
  if (expedition.overallAltitude < 40) {
    recs.push('Expedition altitude is dangerously low — focus on peak quality and summit resilience first')
  }
  const allFlat = ranges.every(r => r.rangeType === 'no-range' || r.rangeType === 'flat-plain')
  if (allFlat && ranges.length > 0) {
    recs.push('All mountain ranges are flat — consider a major expedition reconstruction')
  }
  const valleyFiles = peaks.filter(p => p.condition === 'valley-floor').map(p => p.file)
  if (valleyFiles.length > 0 && valleyFiles.length <= 3) {
    recs.push(`Begin ascent for these valley files: ${valleyFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Standing at the platinum zenith! Every peak shines with masterful quality at the summit of achievement')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as platinum peak
 * @example
 * const peak = analyzePlatinumPeak(content, 'index.ts')
 * console.log(peak.condition) // 'platinum-masterpiece'
 */
export function analyzePlatinumPeak(content: string, filePath: string): PlatinumPeak {
  const perfecting = measurePerfecting(content)
  const clarifying = measureClarifying(content)
  const strengthening = measureStrengthening(content)
  const precisioning = measurePrecisioning(content)
  const knowing = measureKnowing(content)

  const qualityScore = Math.round(
    perfecting.quality * 0.2 +
    clarifying.clarity * 0.2 +
    strengthening.resilience * 0.2 +
    precisioning.precision * 0.2 +
    knowing.wisdom * 0.2,
  )

  return {
    file: filePath,
    peakQuality: perfecting.quality,
    pinnacleClarity: clarifying.clarity,
    summitResilience: strengthening.resilience,
    altitudePrecision: precisioning.precision,
    zenithWisdom: knowing.wisdom,
    perfecting, clarifying, strengthening, precisioning, knowing,
    condition: classifyPeakCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as mountain range
 * @example
 * const range = analyzeMountainRange(peaks, 'src')
 * console.log(range.rangeType) // 'himalayan-range'
 */
export function analyzeMountainRange(peaks: PlatinumPeak[], dirPath: string): MountainRange {
  if (peaks.length === 0) {
    return {
      directory: dirPath, peaks: [], avgQuality: 0, avgClarity: 0,
      avgWisdom: 0, platinumMasterpieceCount: 0, valleyFloorCount: 0,
      rangeType: 'no-range', condition: 'void',
    }
  }

  const avgQuality = Math.round(peaks.reduce((s, p) => s + p.peakQuality, 0) / peaks.length)
  const avgClarity = Math.round(peaks.reduce((s, p) => s + p.pinnacleClarity, 0) / peaks.length)
  const avgWisdom = Math.round(peaks.reduce((s, p) => s + p.zenithWisdom, 0) / peaks.length)
  const platinumMasterpieceCount = peaks.filter(p => p.condition === 'platinum-masterpiece').length
  const valleyFloorCount = peaks.filter(p => p.condition === 'valley-floor').length
  const avgQs = Math.round(peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length)

  return {
    directory: dirPath, peaks, avgQuality, avgClarity, avgWisdom,
    platinumMasterpieceCount, valleyFloorCount,
    rangeType: classifyRangeType(peaks),
    condition: classifyRangeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete platinum zenith result
 * @example
 * const result = await buildPlatinumZenithResult(files, contents)
 * console.log(result.stats.climberGrade) // 'mountain-master'
 */
export async function buildPlatinumZenithResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PlatinumZenithResult> {
  const peaks = files.map((file, i) => analyzePlatinumPeak(contents[i] ?? '', file))

  const dirMap = new Map<string, PlatinumPeak[]>()
  for (const peak of peaks) {
    const dir = path.dirname(peak.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(peak) } else { dirMap.set(dir, [peak]) }
  }

  const ranges = Array.from(dirMap.entries()).map(([dir, dirPeaks]) =>
    analyzeMountainRange(dirPeaks, dir),
  )

  const avgQuality = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.peakQuality, 0) / peaks.length) : 0
  const avgClarity = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.pinnacleClarity, 0) / peaks.length) : 0
  const avgWisdom = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.zenithWisdom, 0) / peaks.length) : 0

  const overallAltitude = peaks.length > 0
    ? Math.round((avgQuality + avgClarity + avgWisdom) / 3) : 0
  const isSummit = avgQuality >= 60

  const expedition: PlatinumExpedition = { avgQuality, avgClarity, avgWisdom, isSummit, overallAltitude }

  const celebration: PlatinumCelebration = {
    milestone: 510,
    name: 'platinum-zenith',
    message: 'Command #510 — Standing at the platinum zenith. 510 commands, each one a step upward. The summit is not the end — it is where the next ascent begins.',
    previousMilestones: [420, 430, 440, 450, 460, 470, 480, 490, 500],
    totalTests: 89000,
  }

  const avgSummitResilience = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.summitResilience, 0) / peaks.length) : 0
  const avgAltitudePrecision = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.altitudePrecision, 0) / peaks.length) : 0

  const bestPeak = peaks.length > 0
    ? peaks.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const highestQuality = peaks.length > 0
    ? peaks.reduce((best, p) => p.peakQuality > best.peakQuality ? p : best).file : ''
  const clearestView = peaks.length > 0
    ? peaks.reduce((best, p) => p.pinnacleClarity > best.pinnacleClarity ? p : best).file : ''
  const strongest = peaks.length > 0
    ? peaks.reduce((best, p) => p.summitResilience > best.summitResilience ? p : best).file : ''
  const wisest = peaks.length > 0
    ? peaks.reduce((best, p) => p.zenithWisdom > best.zenithWisdom ? p : best).file : ''

  const stats: PlatinumZenithStats = {
    totalFiles: peaks.length,
    totalRanges: ranges.length,
    avgPeakQuality: avgQuality,
    avgPinnacleClarity: avgClarity,
    avgSummitResilience,
    avgAltitudePrecision,
    avgZenithWisdom: avgWisdom,
    platinumMasterpieceCount: peaks.filter(p => p.condition === 'platinum-masterpiece').length,
    goldenSummitCount: peaks.filter(p => p.condition === 'golden-summit').length,
    properPeakCount: peaks.filter(p => p.condition === 'proper-peak').length,
    rockyRidgeCount: peaks.filter(p => p.condition === 'rocky-ridge').length,
    gravelSlopeCount: peaks.filter(p => p.condition === 'gravel-slope').length,
    valleyFloorCount: peaks.filter(p => p.condition === 'valley-floor').length,
    hasHighQualityCount: peaks.filter(p => p.perfecting.hasHighQuality).length,
    hasHighClarityCount: peaks.filter(p => p.clarifying.hasHighClarity).length,
    hasHighResilienceCount: peaks.filter(p => p.strengthening.hasHighResilience).length,
    hasHighPrecisionCount: peaks.filter(p => p.precisioning.hasHighPrecision).length,
    hasHighWisdomCount: peaks.filter(p => p.knowing.hasHighWisdom).length,
    overallAltitude,
    climberGrade: classifyClimberGrade(overallAltitude),
    bestPeak, highestQuality, clearestView, strongest, wisest,
  }

  const recommendations = generateRecommendations(peaks, ranges, expedition, stats)

  return { peaks, ranges, expedition, celebration, stats, recommendations }
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
