// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PreservationGrade = 'eternal-ice' | 'well-preserved' | 'proper-crystal' | 'melting-ice' | 'thawed-water' | 'no-preservation'
export type ClarityIce = 'crystal-clear' | 'transparent-ice' | 'proper-clarity' | 'cloudy-ice' | 'frozen-mud' | 'opaque'
export type StabilityPermafrost = 'bedrock-solid' | 'deep-permafrost' | 'proper-foundation' | 'shifting-ground' | 'thawing-permafrost' | 'no-stability'
export type ResilienceFrost = 'arctic-survivor' | 'frost-hardened' | 'proper-endurance' | 'cold-sensitive' | 'frostbitten' | 'no-endurance'
export type BeautyAurora = 'northern-lights' | 'aurora-borealis' | 'proper-glow' | 'dim-light' | 'gray-sky' | 'no-aurora'
export type CrystalCondition = 'frost-masterpiece' | 'ice-cathedral' | 'proper-glacier' | 'melting-ice' | 'slush' | 'puddle'
export type HallType = 'ice-cathedral' | 'glacier-hall' | 'proper-cave' | 'ice-shelter' | 'snow-drift' | 'no-hall'
export type HallCondition = 'eternal-sanctuary' | 'frost-palace' | 'decent-shelter' | 'melting-cave' | 'slush-pit' | 'void'
export type GuardianGrade = 'frost-guardian' | 'ice-keeper' | 'skilled-steward' | 'apprentice' | 'novice' | 'thawer'

export interface PreservingMeasure {
  preservation: number
  grade: PreservationGrade
  hasHighPreservation: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  hasStableAPI: boolean
  hasNoVolatileAPI: boolean
  hasMigrationPaths: boolean
  hasNoDeadEnds: boolean
  hasDeprecationPolicy: boolean
  hasNoSuddenRemoval: boolean
  breakingChangesCount: number
  volatileAPICount: number
}

export interface ClarifyingMeasure {
  clarity: number
  ice: ClarityIce
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  hasNoDense: boolean
  hasUnderstandable: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface StabilizingMeasure {
  stability: number
  permafrost: StabilityPermafrost
  hasHighStability: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasSolid: boolean
  mutableCount: number
  leakedCount: number
}

export interface EnduringMeasure {
  resilience: number
  frost: ResilienceFrost
  hasHighResilience: boolean
  hasErrorHandling: boolean
  hasEdgeCaseCoverage: boolean
  hasNoBareCrash: boolean
  hasRetryLogic: boolean
  hasNoSingleFail: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasDefensiveCode: boolean
  hasNoTrusting: boolean
  hasFaultTolerant: boolean
  bareCrashCount: number
  singleFailCount: number
}

export interface BeautifyingMeasure {
  beauty: number
  aurora: BeautyAurora
  hasHighBeauty: boolean
  hasElegant: boolean
  hasReadable: boolean
  hasNoUgly: boolean
  hasWellFormatted: boolean
  hasNoMessy: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasBeautiful: boolean
  hasNoClunky: boolean
  hasGraceful: boolean
  uglyCount: number
  messyCount: number
}

export interface IceCrystal {
  file: string
  crystalPreservation: number
  iceClarity: number
  permafrostStability: number
  frostResilience: number
  auroraBeauty: number
  preserving: PreservingMeasure
  clarifying: ClarifyingMeasure
  stabilizing: StabilizingMeasure
  enduring: EnduringMeasure
  beautifying: BeautifyingMeasure
  condition: CrystalCondition
  qualityScore: number
}

export interface GlacierHall {
  directory: string
  crystals: IceCrystal[]
  avgPreservation: number
  avgClarity: number
  avgStability: number
  frostMasterpieceCount: number
  puddleCount: number
  hallType: HallType
  condition: HallCondition
}

export interface FrostArctic {
  avgPreservation: number
  avgClarity: number
  avgStability: number
  isFrozen: boolean
  overallFrost: number
}

export interface FrostSanctuaryStats {
  totalFiles: number
  totalHalls: number
  avgCrystalPreservation: number
  avgIceClarity: number
  avgPermafrostStability: number
  avgFrostResilience: number
  avgAuroraBeauty: number
  frostMasterpieceCount: number
  iceCathedralCount: number
  properGlacierCount: number
  meltingIceCount: number
  slushCount: number
  puddleCount: number
  hasHighPreservationCount: number
  hasHighClarityCount: number
  hasHighStabilityCount: number
  hasHighResilienceCount: number
  hasHighBeautyCount: number
  overallFrost: number
  guardianGrade: GuardianGrade
  bestCrystal: string
  bestPreserved: string
  clearest: string
  mostStable: string
  mostBeautiful: string
}

export interface FrostSanctuaryResult {
  crystals: IceCrystal[]
  halls: GlacierHall[]
  arctic: FrostArctic
  stats: FrostSanctuaryStats
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
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^=]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure crystal preservation (quality over time)
 * @example
 * const m = measurePreserving(content)
 * console.log(m.grade) // 'eternal-ice'
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasStrictEq(content) ? 4 : 0

  const hasBackwardCompatible = hasExport(content) && hasInterface(content)
  const hasVersioned = hasTypeAlias(content) && hasReturnType(content)
  const hasStableAPI = hasConst(content) && hasNamedExport(content)
  const hasMigrationPaths = hasDocComments(content) && hasReadonly(content)
  const hasDeprecationPolicy = hasEnum(content) && hasGenerics(content)

  score += hasBackwardCompatible ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasStableAPI ? 5 : 0
  score += hasMigrationPaths ? 5 : 0
  score += hasDeprecationPolicy ? 5 : 0

  const preservation = Math.min(score, 100)
  const breakingChangesCount = countMatches(/\bvar\b/, content)
  const volatileAPICount = countMatches(/\bany\b/, content)

  const hasNoBreakingChanges = breakingChangesCount === 0
  const hasNoUnversioned = volatileAPICount === 0
  const hasNoVolatileAPI = !has(/\beval\b/, content)
  const hasNoDeadEnds = !has(/\bdebugger\b/, content)
  const hasNoSuddenRemoval = !has(/\beval\b/, content)
  const hasHighPreservation = preservation >= 70

  let grade: PreservationGrade
  if (preservation >= 85) grade = 'eternal-ice'
  else if (preservation >= 70) grade = 'well-preserved'
  else if (preservation >= 55) grade = 'proper-crystal'
  else if (preservation >= 40) grade = 'melting-ice'
  else if (preservation >= 25) grade = 'thawed-water'
  else grade = 'no-preservation'

  return {
    preservation, grade, hasHighPreservation, hasBackwardCompatible, hasNoBreakingChanges,
    hasVersioned, hasNoUnversioned, hasStableAPI, hasNoVolatileAPI, hasMigrationPaths,
    hasNoDeadEnds, hasDeprecationPolicy, hasNoSuddenRemoval,
    breakingChangesCount, volatileAPICount,
  }
}

/**
 * Measure ice clarity (transparency/readability)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.ice) // 'crystal-clear'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasStrictEq(content) ? 4 : 0

  const hasReadable = hasDocComments(content) && hasInterface(content)
  const hasSelfDocumenting = hasExport(content) && hasReturnType(content)
  const hasVisible = hasNamedExport(content) && hasTypeAlias(content)
  const hasClear = hasConst(content) && hasEnum(content)
  const hasTransparent = hasGenerics(content) && hasExport(content)
  const hasUnderstandable = hasReadonly(content) && hasOptional(content)

  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasUnderstandable ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\beval\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = countMatches(/\bany\b/, content) === 0
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let ice: ClarityIce
  if (clarity >= 85) ice = 'crystal-clear'
  else if (clarity >= 70) ice = 'transparent-ice'
  else if (clarity >= 55) ice = 'proper-clarity'
  else if (clarity >= 40) ice = 'cloudy-ice'
  else if (clarity >= 25) ice = 'frozen-mud'
  else ice = 'opaque'

  return {
    clarity, ice, hasHighClarity, hasReadable, hasTransparent, hasNoObfuscated,
    hasSelfDocumenting, hasNoCryptic, hasVisible, hasNoHidden, hasClear, hasNoDense,
    hasUnderstandable, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure permafrost stability (immutable foundation)
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.permafrost) // 'bedrock-solid'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasImmutable = hasReadonly(content) && hasConst(content)
  const hasEncapsulated = hasPrivate(content) && hasClass(content)
  const hasTypeSafe = hasInterface(content) && hasReturnType(content)
  const hasTested = hasEnum(content) && hasTypeAlias(content)
  const hasConsistent = hasStrictEq(content) && hasGenerics(content)
  const hasSolid = hasExport(content) && hasDocComments(content)

  score += hasImmutable ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasSolid ? 5 : 0

  const stability = Math.min(score, 100)
  const mutableCount = countMatches(/\bvar\b/, content)
  const leakedCount = countMatches(/\bany\b/, content)

  const hasNoMutable = mutableCount === 0
  const hasNoLeaked = leakedCount === 0
  const hasNoUnsafe = countMatches(/\beval\b/, content) === 0
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasNoInconsistent = !has(/\beval\b/, content)
  const hasHighStability = stability >= 70

  let permafrost: StabilityPermafrost
  if (stability >= 85) permafrost = 'bedrock-solid'
  else if (stability >= 70) permafrost = 'deep-permafrost'
  else if (stability >= 55) permafrost = 'proper-foundation'
  else if (stability >= 40) permafrost = 'shifting-ground'
  else if (stability >= 25) permafrost = 'thawing-permafrost'
  else permafrost = 'no-stability'

  return {
    stability, permafrost, hasHighStability, hasImmutable, hasNoMutable,
    hasEncapsulated, hasNoLeaked, hasTypeSafe, hasNoUnsafe, hasTested,
    hasNoUntested, hasConsistent, hasNoInconsistent, hasSolid,
    mutableCount, leakedCount,
  }
}

/**
 * Measure frost resilience (extreme condition handling)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.frost) // 'arctic-survivor'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0

  const hasErrorHandling = hasTryCatch(content) && hasThrow(content)
  const hasEdgeCaseCoverage = hasConditional(content) && hasStrictEq(content)
  const hasRetryLogic = hasAsync(content) && hasTryCatch(content)
  const hasGracefulDegradation = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasDefensiveCode = hasOptional(content) && hasReturnType(content)
  const hasFaultTolerant = hasExport(content) && hasInterface(content)

  score += hasErrorHandling ? 5 : 0
  score += hasEdgeCaseCoverage ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasDefensiveCode ? 5 : 0
  score += hasFaultTolerant ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const singleFailCount = countMatches(/\beval\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoSingleFail = singleFailCount === 0
  const hasNoHardCrash = countMatches(/\bany\b/, content) === 0
  const hasNoTrusting = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let frost: ResilienceFrost
  if (resilience >= 85) frost = 'arctic-survivor'
  else if (resilience >= 70) frost = 'frost-hardened'
  else if (resilience >= 55) frost = 'proper-endurance'
  else if (resilience >= 40) frost = 'cold-sensitive'
  else if (resilience >= 25) frost = 'frostbitten'
  else frost = 'no-endurance'

  return {
    resilience, frost, hasHighResilience, hasErrorHandling, hasEdgeCaseCoverage,
    hasNoBareCrash, hasRetryLogic, hasNoSingleFail, hasGracefulDegradation,
    hasNoHardCrash, hasDefensiveCode, hasNoTrusting, hasFaultTolerant,
    bareCrashCount, singleFailCount,
  }
}

/**
 * Measure aurora beauty (aesthetic quality)
 * @example
 * const m = measureBeautifying(content)
 * console.log(m.aurora) // 'northern-lights'
 */
export function measureBeautifying(content: string): BeautifyingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasUnionType(content) ? 4 : 0

  const hasElegant = hasExport(content) && hasInterface(content)
  const hasReadable = hasDocComments(content) && hasReturnType(content)
  const hasWellFormatted = hasConst(content) && hasNamedExport(content)
  const hasConsistent = hasEnum(content) && hasTypeAlias(content)
  const hasBeautiful = hasReadonly(content) && hasOptional(content)
  const hasGraceful = hasGenerics(content) && hasUnionType(content)

  score += hasElegant ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasWellFormatted ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasBeautiful ? 5 : 0
  score += hasGraceful ? 5 : 0

  const beauty = Math.min(score, 100)
  const uglyCount = countMatches(/\bvar\b/, content)
  const messyCount = countMatches(/\beval\b/, content)

  const hasNoUgly = uglyCount === 0
  const hasNoMessy = messyCount === 0
  const hasNoInconsistent = countMatches(/\bany\b/, content) === 0
  const hasNoClunky = !has(/\bdebugger\b/, content)
  const hasHighBeauty = beauty >= 70

  let aurora: BeautyAurora
  if (beauty >= 85) aurora = 'northern-lights'
  else if (beauty >= 70) aurora = 'aurora-borealis'
  else if (beauty >= 55) aurora = 'proper-glow'
  else if (beauty >= 40) aurora = 'dim-light'
  else if (beauty >= 25) aurora = 'gray-sky'
  else aurora = 'no-aurora'

  return {
    beauty, aurora, hasHighBeauty, hasElegant, hasReadable, hasNoUgly,
    hasWellFormatted, hasNoMessy, hasConsistent, hasNoInconsistent,
    hasBeautiful, hasNoClunky, hasGraceful, uglyCount, messyCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify crystal condition
 * @example
 * classifyCrystalCondition(90) // 'frost-masterpiece'
 */
export function classifyCrystalCondition(score: number): CrystalCondition {
  if (score >= 85) return 'frost-masterpiece'
  if (score >= 70) return 'ice-cathedral'
  if (score >= 55) return 'proper-glacier'
  if (score >= 40) return 'melting-ice'
  if (score >= 25) return 'slush'
  return 'puddle'
}

/**
 * Classify hall type
 * @example
 * classifyHallType(crystals) // 'ice-cathedral'
 */
export function classifyHallType(crystals: IceCrystal[]): HallType {
  if (crystals.length === 0) return 'no-hall'
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
  const masterpieceRatio = crystals.filter(c => c.condition === 'frost-masterpiece').length / crystals.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'ice-cathedral'
  if (avgQs >= 60) return 'glacier-hall'
  if (avgQs >= 45) return 'proper-cave'
  if (avgQs >= 30) return 'ice-shelter'
  if (avgQs >= 15) return 'snow-drift'
  return 'no-hall'
}

/**
 * Classify hall condition
 * @example
 * classifyHallCondition(80) // 'eternal-sanctuary'
 */
export function classifyHallCondition(avgQs: number): HallCondition {
  if (avgQs >= 75) return 'eternal-sanctuary'
  if (avgQs >= 60) return 'frost-palace'
  if (avgQs >= 45) return 'decent-shelter'
  if (avgQs >= 30) return 'melting-cave'
  if (avgQs >= 15) return 'slush-pit'
  return 'void'
}

/**
 * Classify guardian grade
 * @example
 * classifyGuardianGrade(85) // 'frost-guardian'
 */
export function classifyGuardianGrade(avgFrost: number): GuardianGrade {
  if (avgFrost >= 80) return 'frost-guardian'
  if (avgFrost >= 65) return 'ice-keeper'
  if (avgFrost >= 50) return 'skilled-steward'
  if (avgFrost >= 35) return 'apprentice'
  if (avgFrost >= 20) return 'novice'
  return 'thawer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(crystals, halls, arctic, stats)
 */
export function generateRecommendations(
  crystals: IceCrystal[],
  halls: GlacierHall[],
  arctic: FrostArctic,
  stats: FrostSanctuaryStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrystalPreservation < 50) {
    recs.push('Deepen crystal preservation with stable exports, versioned types, and migration paths')
  }
  if (stats.avgIceClarity < 50) {
    recs.push('Improve ice clarity with documentation, transparent naming, and self-documenting types')
  }
  if (stats.avgPermafrostStability < 50) {
    recs.push('Strengthen permafrost stability with immutable patterns, encapsulation, and type safety')
  }
  if (stats.avgFrostResilience < 50) {
    recs.push('Bolster frost resilience with error handling, edge case coverage, and defensive coding')
  }
  if (stats.avgAuroraBeauty < 50) {
    recs.push('Enhance aurora beauty with elegant patterns, consistent formatting, and graceful designs')
  }
  if (stats.puddleCount > 0) {
    recs.push(`${stats.puddleCount} file(s) are puddles — they need complete frost reconstruction`)
  }
  if (arctic.overallFrost < 40) {
    recs.push('Overall frost is dangerously low — focus on preservation and clarity first')
  }
  const allWeak = halls.every(h => h.hallType === 'no-hall' || h.hallType === 'snow-drift')
  if (allWeak && halls.length > 0) {
    recs.push('All halls are weak — consider a major frost sanctuary reconstruction')
  }
  const puddleFiles = crystals.filter(c => c.condition === 'puddle').map(c => c.file)
  if (puddleFiles.length > 0 && puddleFiles.length <= 3) {
    recs.push(`Rebuild these puddles: ${puddleFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The frost sanctuary stands eternal! Every crystal gleams with preservation, clarity, stability, resilience, and beauty')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ice crystal
 * @example
 * const crystal = analyzeIceCrystal(content, 'index.ts')
 * console.log(crystal.condition) // 'frost-masterpiece'
 */
export function analyzeIceCrystal(content: string, filePath: string): IceCrystal {
  const preserving = measurePreserving(content)
  const clarifying = measureClarifying(content)
  const stabilizing = measureStabilizing(content)
  const enduring = measureEnduring(content)
  const beautifying = measureBeautifying(content)

  const qualityScore = Math.round(
    preserving.preservation * 0.2 +
    clarifying.clarity * 0.2 +
    stabilizing.stability * 0.2 +
    enduring.resilience * 0.2 +
    beautifying.beauty * 0.2,
  )

  return {
    file: filePath,
    crystalPreservation: preserving.preservation,
    iceClarity: clarifying.clarity,
    permafrostStability: stabilizing.stability,
    frostResilience: enduring.resilience,
    auroraBeauty: beautifying.beauty,
    preserving, clarifying, stabilizing, enduring, beautifying,
    condition: classifyCrystalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as glacier hall
 * @example
 * const hall = analyzeGlacierHall(crystals, 'src')
 * console.log(hall.hallType) // 'ice-cathedral'
 */
export function analyzeGlacierHall(crystals: IceCrystal[], dirPath: string): GlacierHall {
  if (crystals.length === 0) {
    return {
      directory: dirPath, crystals: [], avgPreservation: 0, avgClarity: 0,
      avgStability: 0, frostMasterpieceCount: 0, puddleCount: 0,
      hallType: 'no-hall', condition: 'void',
    }
  }

  const avgPreservation = Math.round(crystals.reduce((s, c) => s + c.crystalPreservation, 0) / crystals.length)
  const avgClarity = Math.round(crystals.reduce((s, c) => s + c.iceClarity, 0) / crystals.length)
  const avgStability = Math.round(crystals.reduce((s, c) => s + c.permafrostStability, 0) / crystals.length)
  const frostMasterpieceCount = crystals.filter(c => c.condition === 'frost-masterpiece').length
  const puddleCount = crystals.filter(c => c.condition === 'puddle').length
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)

  return {
    directory: dirPath, crystals, avgPreservation, avgClarity, avgStability,
    frostMasterpieceCount, puddleCount,
    hallType: classifyHallType(crystals),
    condition: classifyHallCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete frost sanctuary result
 * @example
 * const result = await buildFrostSanctuaryResult(files, contents)
 * console.log(result.stats.guardianGrade) // 'frost-guardian'
 */
export async function buildFrostSanctuaryResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<FrostSanctuaryResult> {
  const crystals = files.map((file, i) => analyzeIceCrystal(contents[i] ?? '', file))

  const dirMap = new Map<string, IceCrystal[]>()
  for (const crystal of crystals) {
    const dir = path.dirname(crystal.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(crystal) } else { dirMap.set(dir, [crystal]) }
  }

  const halls = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeGlacierHall(dirCrystals, dir),
  )

  const avgPreservation = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.crystalPreservation, 0) / crystals.length) : 0
  const avgClarity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.iceClarity, 0) / crystals.length) : 0
  const avgStability = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.permafrostStability, 0) / crystals.length) : 0

  const overallFrost = crystals.length > 0
    ? Math.round((avgPreservation + avgClarity + avgStability) / 3) : 0
  const isFrozen = avgPreservation >= 60

  const arctic: FrostArctic = { avgPreservation, avgClarity, avgStability, isFrozen, overallFrost }

  const avgFrostResilience = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.frostResilience, 0) / crystals.length) : 0
  const avgAuroraBeauty = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.auroraBeauty, 0) / crystals.length) : 0

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const bestPreserved = crystals.length > 0
    ? crystals.reduce((best, c) => c.crystalPreservation > best.crystalPreservation ? c : best).file : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => c.iceClarity > best.iceClarity ? c : best).file : ''
  const mostStable = crystals.length > 0
    ? crystals.reduce((best, c) => c.permafrostStability > best.permafrostStability ? c : best).file : ''
  const mostBeautiful = crystals.length > 0
    ? crystals.reduce((best, c) => c.auroraBeauty > best.auroraBeauty ? c : best).file : ''

  const stats: FrostSanctuaryStats = {
    totalFiles: crystals.length,
    totalHalls: halls.length,
    avgCrystalPreservation: avgPreservation,
    avgIceClarity: avgClarity,
    avgPermafrostStability: avgStability,
    avgFrostResilience,
    avgAuroraBeauty,
    frostMasterpieceCount: crystals.filter(c => c.condition === 'frost-masterpiece').length,
    iceCathedralCount: crystals.filter(c => c.condition === 'ice-cathedral').length,
    properGlacierCount: crystals.filter(c => c.condition === 'proper-glacier').length,
    meltingIceCount: crystals.filter(c => c.condition === 'melting-ice').length,
    slushCount: crystals.filter(c => c.condition === 'slush').length,
    puddleCount: crystals.filter(c => c.condition === 'puddle').length,
    hasHighPreservationCount: crystals.filter(c => c.preserving.hasHighPreservation).length,
    hasHighClarityCount: crystals.filter(c => c.clarifying.hasHighClarity).length,
    hasHighStabilityCount: crystals.filter(c => c.stabilizing.hasHighStability).length,
    hasHighResilienceCount: crystals.filter(c => c.enduring.hasHighResilience).length,
    hasHighBeautyCount: crystals.filter(c => c.beautifying.hasHighBeauty).length,
    overallFrost,
    guardianGrade: classifyGuardianGrade(overallFrost),
    bestCrystal, bestPreserved, clearest, mostStable, mostBeautiful,
  }

  const recommendations = generateRecommendations(crystals, halls, arctic, stats)

  return { crystals, halls, arctic, stats, recommendations }
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
