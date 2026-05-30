// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type OrientingGrade = 'true-north' | 'clear-bearing' | 'proper-direction' | 'vague-heading' | 'lost-direction' | 'no-direction'
export type CalibratingBearing = 'laser-precision' | 'accurate-bearing' | 'proper-aim' | 'approximate-heading' | 'drifting-bearing' | 'no-bearing'
export type NavigatingMap = 'charted-waters' | 'clear-map' | 'proper-chart' | 'foggy-route' | 'uncharted-territory' | 'no-map'
export type BalancingCardinal = 'perfect-balance' | 'proper-equilibrium' | 'decent-balance' | 'tilted-compass' | 'unbalanced' | 'no-balance'
export type SteadyingNeedle = 'rock-steady' | 'stable-compass' | 'proper-needle' | 'wavering-needle' | 'spinning-compass' | 'no-needle'
export type NeedleCondition = 'master-compass' | 'jade-sextant' | 'proper-compass' | 'rusty-needle' | 'broken-compass' | 'stone'
export type RoseType = 'grand-compass-rose' | 'proper-rose' | 'decent-cardinal' | 'simple-arrow' | 'scratched-circle' | 'no-rose'
export type RoseCondition = 'navigation-masterpiece' | 'reliable-compass' | 'decent-guide' | 'unreliable-needle' | 'broken-device' | 'void'
export type NavigatorGrade = 'grand-navigator' | 'sea-captain' | 'skilled-pilot' | 'apprentice' | 'novice' | 'lost-wanderer'

export interface OrientingMeasure {
  clarity: number
  grade: OrientingGrade
  hasHighClarity: boolean
  hasClearPurpose: boolean
  hasSingleResponsibility: boolean
  hasNoMixedConcerns: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasIntentional: boolean
  hasNoRandom: boolean
  hasWellScoped: boolean
  hasNoOverreach: boolean
  hasDirected: boolean
  mixedConcernsCount: number
  scatteredCount: number
}

export interface CalibratingMeasure {
  accuracy: number
  bearing: CalibratingBearing
  hasHighAccuracy: boolean
  hasPrecise: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoVague: boolean
  hasAccurate: boolean
  approximateCount: number
  sloppyCount: number
}

export interface NavigatingMeasure {
  quality: number
  navigation: NavigatingMap
  hasHighQuality: boolean
  hasReadable: boolean
  hasWellStructured: boolean
  hasNoObfuscated: boolean
  hasSearchable: boolean
  hasNoHidden: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasFindable: boolean
  hasNoBuried: boolean
  hasNavigable: boolean
  obfuscatedCount: number
  hiddenCount: number
}

export interface BalancingMeasure {
  balance: number
  cardinal: BalancingCardinal
  hasHighBalance: boolean
  hasEvenDistribution: boolean
  hasNoGodFunctions: boolean
  hasProportional: boolean
  hasNoOverweight: boolean
  hasWellSized: boolean
  hasNoGiant: boolean
  hasFairAllocation: boolean
  hasNoResourceHoarding: boolean
  hasReasonable: boolean
  hasNoExtreme: boolean
  godFunctionCount: number
  overweightCount: number
}

export interface SteadyingMeasure {
  steadiness: number
  needle: SteadyingNeedle
  hasHighSteadiness: boolean
  hasConsistent: boolean
  hasUniformStyle: boolean
  hasNoMixed: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasDependable: boolean
  mixedCount: number
  surprisingCount: number
}

export interface JadeNeedle {
  file: string
  directionalClarity: number
  bearingAccuracy: number
  navigationQuality: number
  cardinalBalance: number
  needleSteadiness: number
  orienting: OrientingMeasure
  calibrating: CalibratingMeasure
  navigating: NavigatingMeasure
  balancing: BalancingMeasure
  steadying: SteadyingMeasure
  condition: NeedleCondition
  qualityScore: number
}

export interface CompassRose {
  directory: string
  needles: JadeNeedle[]
  avgClarity: number
  avgBalance: number
  avgSteadiness: number
  masterCompassCount: number
  stoneCount: number
  roseType: RoseType
  condition: RoseCondition
}

export interface JadeFleet {
  avgClarity: number
  avgBalance: number
  avgSteadiness: number
  isTrueNorth: boolean
  overallNavigation: number
}

export interface JadeCompassStats {
  totalFiles: number
  totalRoses: number
  avgDirectionalClarity: number
  avgBearingAccuracy: number
  avgNavigationQuality: number
  avgCardinalBalance: number
  avgNeedleSteadiness: number
  masterCompassCount: number
  jadeSextantCount: number
  properCompassCount: number
  rustyNeedleCount: number
  brokenCompassCount: number
  stoneCount: number
  hasHighClarityCount: number
  hasHighAccuracyCount: number
  hasHighQualityCount: number
  hasHighBalanceCount: number
  hasHighSteadinessCount: number
  overallNavigation: number
  navigatorGrade: NavigatorGrade
  bestNeedle: string
  clearestDirection: string
  mostAccurate: string
  mostNavigable: string
  mostBalanced: string
}

export interface JadeCompassResult {
  needles: JadeNeedle[]
  roses: CompassRose[]
  fleet: JadeFleet
  stats: JadeCompassStats
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
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure directional clarity (purpose and direction)
 * @example
 * const m = measureOrienting(content)
 * console.log(m.grade) // 'true-north'
 */
export function measureOrienting(content: string): OrientingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasClearPurpose = hasExport(content) && hasNamedExport(content)
  const hasSingleResponsibility = hasInterface(content) && hasReturnType(content)
  const hasFocused = hasTypeAlias(content) && hasConst(content)
  const hasIntentional = hasImport(content) && hasAsync(content)
  const hasWellScoped = hasDocComments(content) && hasGenerics(content)
  const hasDirected = hasEnum(content) && hasReadonly(content)

  score += hasClearPurpose ? 5 : 0
  score += hasSingleResponsibility ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasIntentional ? 5 : 0
  score += hasWellScoped ? 5 : 0
  score += hasDirected ? 5 : 0

  const clarity = Math.min(score, 100)
  const mixedConcernsCount = countMatches(/\bvar\b/, content)
  const scatteredCount = countMatches(/\bany\b/, content)

  const hasNoMixedConcerns = mixedConcernsCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoRandom = !has(/\beval\b/, content)
  const hasNoOverreach = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: OrientingGrade
  if (clarity >= 85) grade = 'true-north'
  else if (clarity >= 70) grade = 'clear-bearing'
  else if (clarity >= 55) grade = 'proper-direction'
  else if (clarity >= 40) grade = 'vague-heading'
  else if (clarity >= 25) grade = 'lost-direction'
  else grade = 'no-direction'

  return {
    clarity, grade, hasHighClarity, hasClearPurpose, hasSingleResponsibility,
    hasNoMixedConcerns, hasFocused, hasNoScattered, hasIntentional, hasNoRandom,
    hasWellScoped, hasNoOverreach, hasDirected, mixedConcernsCount, scatteredCount,
  }
}

/**
 * Measure bearing accuracy (operation precision)
 * @example
 * const m = measureCalibrating(content)
 * console.log(m.bearing) // 'laser-precision'
 */
export function measureCalibrating(content: string): CalibratingMeasure {
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

  const hasPrecise = hasStrictEq(content) && hasReturnType(content)
  const hasExact = hasInterface(content) && hasConst(content)
  const hasCorrect = hasConditional(content) && hasTryCatch(content)
  const hasSharp = hasThrow(content) && hasEnum(content)
  const hasDefined = hasReadonly(content) && hasOptional(content)
  const hasAccurate = hasGenerics(content) && hasNullishCoalescing(content)

  score += hasPrecise ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasAccurate ? 5 : 0

  const accuracy = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoAlmostRight = sloppyCount === 0
  const hasNoSloppy = !has(/\beval\b/, content)
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighAccuracy = accuracy >= 70

  let bearing: CalibratingBearing
  if (accuracy >= 85) bearing = 'laser-precision'
  else if (accuracy >= 70) bearing = 'accurate-bearing'
  else if (accuracy >= 55) bearing = 'proper-aim'
  else if (accuracy >= 40) bearing = 'approximate-heading'
  else if (accuracy >= 25) bearing = 'drifting-bearing'
  else bearing = 'no-bearing'

  return {
    accuracy, bearing, hasHighAccuracy, hasPrecise, hasExact,
    hasNoApproximate, hasCorrect, hasNoAlmostRight, hasSharp, hasNoSloppy,
    hasDefined, hasNoVague, hasAccurate, approximateCount, sloppyCount,
  }
}

/**
 * Measure navigation quality (readability)
 * @example
 * const m = measureNavigating(content)
 * console.log(m.navigation) // 'charted-waters'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasReadable = hasDocComments(content) && hasExport(content)
  const hasWellStructured = hasNamedExport(content) && hasInterface(content)
  const hasSearchable = hasReturnType(content) && hasTypeAlias(content)
  const hasOrganized = hasImport(content) && hasConst(content)
  const hasFindable = hasGenerics(content) && hasAsync(content)
  const hasNavigable = hasStrictEq(content) && hasReadonly(content)

  score += hasReadable ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasSearchable ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasFindable ? 5 : 0
  score += hasNavigable ? 5 : 0

  const quality = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const hiddenCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoChaotic = !has(/\beval\b/, content)
  const hasNoBuried = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let navigation: NavigatingMap
  if (quality >= 85) navigation = 'charted-waters'
  else if (quality >= 70) navigation = 'clear-map'
  else if (quality >= 55) navigation = 'proper-chart'
  else if (quality >= 40) navigation = 'foggy-route'
  else if (quality >= 25) navigation = 'uncharted-territory'
  else navigation = 'no-map'

  return {
    quality, navigation, hasHighQuality, hasReadable, hasWellStructured,
    hasNoObfuscated, hasSearchable, hasNoHidden, hasOrganized, hasNoChaotic,
    hasFindable, hasNoBuried, hasNavigable, obfuscatedCount, hiddenCount,
  }
}

/**
 * Measure cardinal balance (balanced concerns)
 * @example
 * const m = measureBalancing(content)
 * console.log(m.cardinal) // 'perfect-balance'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasEnum(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasEvenDistribution = hasInterface(content) && hasEnum(content)
  const hasProportional = hasExport(content) && hasImport(content)
  const hasWellSized = hasConst(content) && hasTypeAlias(content)
  const hasFairAllocation = hasReturnType(content) && hasClass(content)
  const hasReasonable = hasPrivate(content) && hasReadonly(content)
  const hasNoGodFunctions = hasGenerics(content) && hasOptional(content)

  score += hasEvenDistribution ? 5 : 0
  score += hasProportional ? 5 : 0
  score += hasWellSized ? 5 : 0
  score += hasFairAllocation ? 5 : 0
  score += hasReasonable ? 5 : 0
  score += (hasNoGodFunctions ? 5 : 0)

  const balance = Math.min(score, 100)
  const godFunctionCount = countMatches(/\bvar\b/, content)
  const overweightCount = countMatches(/\bany\b/, content)

  const hasNoOverweight = overweightCount === 0
  const hasNoGiant = !has(/\beval\b/, content)
  const hasNoResourceHoarding = !has(/\bdebugger\b/, content)
  const hasNoExtreme = godFunctionCount === 0 && overweightCount === 0
  const hasHighBalance = balance >= 70

  let cardinal: BalancingCardinal
  if (balance >= 85) cardinal = 'perfect-balance'
  else if (balance >= 70) cardinal = 'proper-equilibrium'
  else if (balance >= 55) cardinal = 'decent-balance'
  else if (balance >= 40) cardinal = 'tilted-compass'
  else if (balance >= 25) cardinal = 'unbalanced'
  else cardinal = 'no-balance'

  return {
    balance, cardinal, hasHighBalance, hasEvenDistribution, hasNoGodFunctions,
    hasProportional, hasNoOverweight, hasWellSized, hasNoGiant,
    hasFairAllocation, hasNoResourceHoarding, hasReasonable, hasNoExtreme,
    godFunctionCount, overweightCount,
  }
}

/**
 * Measure needle steadiness (consistency)
 * @example
 * const m = measureSteadying(content)
 * console.log(m.needle) // 'rock-steady'
 */
export function measureSteadying(content: string): SteadyingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0

  const hasConsistent = hasConst(content) && hasStrictEq(content)
  const hasUniformStyle = hasReadonly(content) && hasReturnType(content)
  const hasPredictable = hasEnum(content) && hasInterface(content)
  const hasStable = hasExport(content) && hasImport(content)
  const hasReliable = hasTypeAlias(content) && hasGenerics(content)
  const hasDependable = hasOptional(content) && hasTryCatch(content)

  score += hasConsistent ? 5 : 0
  score += hasUniformStyle ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasDependable ? 5 : 0

  const steadiness = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const surprisingCount = countMatches(/\bany\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoSurprising = surprisingCount === 0
  const hasNoVolatile = !has(/\beval\b/, content)
  const hasNoFlaky = !has(/\bdebugger\b/, content)
  const hasHighSteadiness = steadiness >= 70

  let needle: SteadyingNeedle
  if (steadiness >= 85) needle = 'rock-steady'
  else if (steadiness >= 70) needle = 'stable-compass'
  else if (steadiness >= 55) needle = 'proper-needle'
  else if (steadiness >= 40) needle = 'wavering-needle'
  else if (steadiness >= 25) needle = 'spinning-compass'
  else needle = 'no-needle'

  return {
    steadiness, needle, hasHighSteadiness, hasConsistent, hasUniformStyle,
    hasNoMixed, hasPredictable, hasNoSurprising, hasStable, hasNoVolatile,
    hasReliable, hasNoFlaky, hasDependable, mixedCount, surprisingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify needle condition
 * @example
 * classifyNeedleCondition(90) // 'master-compass'
 */
export function classifyNeedleCondition(score: number): NeedleCondition {
  if (score >= 85) return 'master-compass'
  if (score >= 70) return 'jade-sextant'
  if (score >= 55) return 'proper-compass'
  if (score >= 40) return 'rusty-needle'
  if (score >= 25) return 'broken-compass'
  return 'stone'
}

/**
 * Classify rose type
 * @example
 * classifyRoseType(needles) // 'grand-compass-rose'
 */
export function classifyRoseType(needles: JadeNeedle[]): RoseType {
  if (needles.length === 0) return 'no-rose'
  const avgQs = Math.round(needles.reduce((s, n) => s + n.qualityScore, 0) / needles.length)
  const masterpieceRatio = needles.filter(n => n.condition === 'master-compass').length / needles.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-compass-rose'
  if (avgQs >= 60) return 'proper-rose'
  if (avgQs >= 45) return 'decent-cardinal'
  if (avgQs >= 30) return 'simple-arrow'
  if (avgQs >= 15) return 'scratched-circle'
  return 'no-rose'
}

/**
 * Classify rose condition
 * @example
 * classifyRoseCondition(80) // 'navigation-masterpiece'
 */
export function classifyRoseCondition(avgQs: number): RoseCondition {
  if (avgQs >= 75) return 'navigation-masterpiece'
  if (avgQs >= 60) return 'reliable-compass'
  if (avgQs >= 45) return 'decent-guide'
  if (avgQs >= 30) return 'unreliable-needle'
  if (avgQs >= 15) return 'broken-device'
  return 'void'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'grand-navigator'
 */
export function classifyNavigatorGrade(avgNavigation: number): NavigatorGrade {
  if (avgNavigation >= 80) return 'grand-navigator'
  if (avgNavigation >= 65) return 'sea-captain'
  if (avgNavigation >= 50) return 'skilled-pilot'
  if (avgNavigation >= 35) return 'apprentice'
  if (avgNavigation >= 20) return 'novice'
  return 'lost-wanderer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(needles, roses, fleet, stats)
 */
export function generateRecommendations(
  needles: JadeNeedle[],
  roses: CompassRose[],
  fleet: JadeFleet,
  stats: JadeCompassStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDirectionalClarity < 50) {
    recs.push('Sharpen directional clarity with clear exports, single-responsibility modules, and focused purpose')
  }
  if (stats.avgBearingAccuracy < 50) {
    recs.push('Improve bearing accuracy with strict equality, precise types, and exact return definitions')
  }
  if (stats.avgNavigationQuality < 50) {
    recs.push('Enhance navigation quality with documentation, structured exports, and searchable naming')
  }
  if (stats.avgCardinalBalance < 50) {
    recs.push('Restore cardinal balance with even type distribution, proportional exports, and well-sized modules')
  }
  if (stats.avgNeedleSteadiness < 50) {
    recs.push('Steady the needle with const declarations, consistent patterns, and reliable error handling')
  }
  if (stats.stoneCount > 0) {
    recs.push(`${stats.stoneCount} file(s) are stones — they need complete navigational construction`)
  }
  if (fleet.overallNavigation < 40) {
    recs.push('Fleet navigation is poor — focus on directional clarity and bearing accuracy first')
  }
  const allBroken = roses.every(r => r.roseType === 'no-rose' || r.roseType === 'scratched-circle')
  if (allBroken && roses.length > 0) {
    recs.push('All compass roses are broken — consider a major navigational reconstruction')
  }
  const stoneFiles = needles.filter(n => n.condition === 'stone').map(n => n.file)
  if (stoneFiles.length > 0 && stoneFiles.length <= 3) {
    recs.push(`Carve these stones into compasses: ${stoneFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your jade compass points true north with unwavering precision! Navigation is masterful')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as jade needle
 * @example
 * const needle = analyzeJadeNeedle(content, 'index.ts')
 * console.log(needle.condition) // 'master-compass'
 */
export function analyzeJadeNeedle(content: string, filePath: string): JadeNeedle {
  const orienting = measureOrienting(content)
  const calibrating = measureCalibrating(content)
  const navigating = measureNavigating(content)
  const balancing = measureBalancing(content)
  const steadying = measureSteadying(content)

  const qualityScore = Math.round(
    orienting.clarity * 0.2 +
    calibrating.accuracy * 0.2 +
    navigating.quality * 0.2 +
    balancing.balance * 0.2 +
    steadying.steadiness * 0.2,
  )

  return {
    file: filePath,
    directionalClarity: orienting.clarity,
    bearingAccuracy: calibrating.accuracy,
    navigationQuality: navigating.quality,
    cardinalBalance: balancing.balance,
    needleSteadiness: steadying.steadiness,
    orienting, calibrating, navigating, balancing, steadying,
    condition: classifyNeedleCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as compass rose
 * @example
 * const rose = analyzeCompassRose(needles, 'src')
 * console.log(rose.roseType) // 'grand-compass-rose'
 */
export function analyzeCompassRose(needles: JadeNeedle[], dirPath: string): CompassRose {
  if (needles.length === 0) {
    return {
      directory: dirPath, needles: [], avgClarity: 0, avgBalance: 0,
      avgSteadiness: 0, masterCompassCount: 0, stoneCount: 0,
      roseType: 'no-rose', condition: 'void',
    }
  }

  const avgClarity = Math.round(needles.reduce((s, n) => s + n.directionalClarity, 0) / needles.length)
  const avgBalance = Math.round(needles.reduce((s, n) => s + n.cardinalBalance, 0) / needles.length)
  const avgSteadiness = Math.round(needles.reduce((s, n) => s + n.needleSteadiness, 0) / needles.length)
  const masterCompassCount = needles.filter(n => n.condition === 'master-compass').length
  const stoneCount = needles.filter(n => n.condition === 'stone').length
  const avgQs = Math.round(needles.reduce((s, n) => s + n.qualityScore, 0) / needles.length)

  return {
    directory: dirPath, needles, avgClarity, avgBalance, avgSteadiness,
    masterCompassCount, stoneCount,
    roseType: classifyRoseType(needles),
    condition: classifyRoseCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade compass result
 * @example
 * const result = await buildJadeCompassResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'grand-navigator'
 */
export async function buildJadeCompassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeCompassResult> {
  const needles = files.map((file, i) => analyzeJadeNeedle(contents[i] ?? '', file))

  const dirMap = new Map<string, JadeNeedle[]>()
  for (const needle of needles) {
    const dir = path.dirname(needle.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(needle) } else { dirMap.set(dir, [needle]) }
  }

  const roses = Array.from(dirMap.entries()).map(([dir, dirNeedles]) =>
    analyzeCompassRose(dirNeedles, dir),
  )

  const avgClarity = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.directionalClarity, 0) / needles.length) : 0
  const avgBalance = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.cardinalBalance, 0) / needles.length) : 0
  const avgSteadiness = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.needleSteadiness, 0) / needles.length) : 0

  const overallNavigation = needles.length > 0
    ? Math.round((avgClarity + avgBalance + avgSteadiness) / 3) : 0
  const isTrueNorth = avgClarity >= 60

  const fleet: JadeFleet = { avgClarity, avgBalance, avgSteadiness, isTrueNorth, overallNavigation }

  const avgBearingAccuracy = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.bearingAccuracy, 0) / needles.length) : 0
  const avgNavigationQuality = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.navigationQuality, 0) / needles.length) : 0

  const bestNeedle = needles.length > 0
    ? needles.reduce((best, n) => n.qualityScore > best.qualityScore ? n : best).file : ''
  const clearestDirection = needles.length > 0
    ? needles.reduce((best, n) => n.directionalClarity > best.directionalClarity ? n : best).file : ''
  const mostAccurate = needles.length > 0
    ? needles.reduce((best, n) => n.bearingAccuracy > best.bearingAccuracy ? n : best).file : ''
  const mostNavigable = needles.length > 0
    ? needles.reduce((best, n) => n.navigationQuality > best.navigationQuality ? n : best).file : ''
  const mostBalanced = needles.length > 0
    ? needles.reduce((best, n) => n.cardinalBalance > best.cardinalBalance ? n : best).file : ''

  const stats: JadeCompassStats = {
    totalFiles: needles.length,
    totalRoses: roses.length,
    avgDirectionalClarity: avgClarity,
    avgBearingAccuracy,
    avgNavigationQuality,
    avgCardinalBalance: avgBalance,
    avgNeedleSteadiness: avgSteadiness,
    masterCompassCount: needles.filter(n => n.condition === 'master-compass').length,
    jadeSextantCount: needles.filter(n => n.condition === 'jade-sextant').length,
    properCompassCount: needles.filter(n => n.condition === 'proper-compass').length,
    rustyNeedleCount: needles.filter(n => n.condition === 'rusty-needle').length,
    brokenCompassCount: needles.filter(n => n.condition === 'broken-compass').length,
    stoneCount: needles.filter(n => n.condition === 'stone').length,
    hasHighClarityCount: needles.filter(n => n.orienting.hasHighClarity).length,
    hasHighAccuracyCount: needles.filter(n => n.calibrating.hasHighAccuracy).length,
    hasHighQualityCount: needles.filter(n => n.navigating.hasHighQuality).length,
    hasHighBalanceCount: needles.filter(n => n.balancing.hasHighBalance).length,
    hasHighSteadinessCount: needles.filter(n => n.steadying.hasHighSteadiness).length,
    overallNavigation,
    navigatorGrade: classifyNavigatorGrade(overallNavigation),
    bestNeedle, clearestDirection, mostAccurate, mostNavigable, mostBalanced,
  }

  const recommendations = generateRecommendations(needles, roses, fleet, stats)

  return { needles, roses, fleet, stats, recommendations }
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
