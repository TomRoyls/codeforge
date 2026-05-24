// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Resilience nature grade */
export type ResilienceGrade =
  | 'ancient-fern'
  | 'hardy-survivor'
  | 'proper-resilience'
  | 'fragile-frond'
  | 'wilting-leaf'
  | 'dead-frond'

/** Frond elegance grade */
export type FrondGrade =
  | 'koru-masterpiece'
  | 'elegant-unfurl'
  | 'proper-frond'
  | 'curled-leaf'
  | 'wilted-frond'
  | 'no-frond'

/** Spore distribution grade */
export type SporeGrade =
  | 'wind-carried'
  | 'wide-spread'
  | 'proper-distribution'
  | 'limited-range'
  | 'dropped-locally'
  | 'no-spore'

/** Rhizome depth grade */
export type RhizomeGrade =
  | 'deep-network'
  | 'strong-rhizome'
  | 'proper-roots'
  | 'shallow-roots'
  | 'surface-root'
  | 'no-rhizome'

/** Fractal pattern grade */
export type FractalGrade =
  | 'golden-spiral'
  | 'proper-fractal'
  | 'self-similar'
  | 'partial-pattern'
  | 'irregular'
  | 'no-pattern'

/** Frond condition */
export type FrondCondition =
  | 'silver-koru'
  | 'lush-frond'
  | 'proper-fern'
  | 'wilted-frond'
  | 'brown-leaf'
  | 'dead-spore'

/** Grove type */
export type GroveType =
  | 'ancient-forest'
  | 'silver-grove'
  | 'proper-fernery'
  | 'small-patch'
  | 'single-frond'
  | 'no-grove'

/** Grove condition */
export type GroveCondition =
  | 'primeval-forest'
  | 'lush-rainforest'
  | 'decent-grove'
  | 'sparse-patch'
  | 'barren-ground'
  | 'void'

/** Botanist grade */
export type BotanistGrade =
  | 'master-botanist'
  | 'expert-horticulturist'
  | 'skilled-gardener'
  | 'apprentice'
  | 'novice'
  | 'withered'

/** Enduring (resilience) measurement */
export interface EnduringMeasure {
  resilience: number
  grade: ResilienceGrade
  hasHighResilience: boolean
  hasErrorRecovery: boolean
  hasGracefulDegradation: boolean
  hasNoBareCrash: boolean
  hasDefensiveCoding: boolean
  hasNoAssumption: boolean
  hasRetryMechanism: boolean
  hasNoSingleFail: boolean
  hasFallbackPaths: boolean
  hasNoDeadEnd: boolean
  hasSelfHealing: boolean
  bareCrashCount: number
  assumptionCount: number
}

/** Unfurling (elegance) measurement */
export interface UnfurlingMeasure {
  elegance: number
  frond: FrondGrade
  hasHighElegance: boolean
  hasReadable: boolean
  hasWellFormatted: boolean
  hasNoDense: boolean
  hasDescriptive: boolean
  hasNoCryptic: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasSpacious: boolean
  hasNoCluttered: boolean
  hasBeautiful: boolean
  denseCount: number
  crypticCount: number
}

/** Dispersing (spore distribution) measurement */
export interface DispersingMeasure {
  distribution: number
  spore: SporeGrade
  hasHighDistribution: boolean
  hasReusedPatterns: boolean
  hasSharedUtilities: boolean
  hasNoDuplicated: boolean
  hasExported: boolean
  hasNoPrivateOnly: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasAccessible: boolean
  hasNoHidden: boolean
  hasComposable: boolean
  duplicatedCount: number
  privateOnlyCount: number
}

/** Rooting (rhizome depth) measurement */
export interface RootingMeasure {
  depth: number
  rhizome: RhizomeGrade
  hasHighDepth: boolean
  hasTestedCore: boolean
  hasTypedFoundation: boolean
  hasNoUntyped: boolean
  hasStableBase: boolean
  hasNoShakyBase: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasVerified: boolean
  hasNoUnverified: boolean
  hasSolid: boolean
  untypedCount: number
  shakyBaseCount: number
}

/** Spiraling (fractal pattern) measurement */
export interface SpiralingMeasure {
  pattern: number
  fractal: FractalGrade
  hasHighPattern: boolean
  hasConsistentStyle: boolean
  hasUniformConventions: boolean
  hasNoMixed: boolean
  hasRepeatedPatterns: boolean
  hasNoRandomVariation: boolean
  hasPredictable: boolean
  hasNoSurprises: boolean
  hasSystematic: boolean
  hasNoAdhoc: boolean
  hasRegular: boolean
  mixedCount: number
  randomVariationCount: number
}

/** Single file analysis */
export interface FernFrond {
  file: string
  resilienceNature: number
  frondElegance: number
  sporeDistribution: number
  rhizomeDepth: number
  fractalPattern: number
  enduring: EnduringMeasure
  unfurling: UnfurlingMeasure
  dispersing: DispersingMeasure
  rooting: RootingMeasure
  spiraling: SpiralingMeasure
  condition: FrondCondition
  qualityScore: number
}

/** Directory-level grove */
export interface FernGrove {
  directory: string
  fronds: FernFrond[]
  avgResilience: number
  avgElegance: number
  avgPattern: number
  silverKoruCount: number
  deadSporeCount: number
  groveType: GroveType
  condition: GroveCondition
}

/** Forest summary */
export interface ForestSummary {
  avgResilience: number
  avgElegance: number
  avgPattern: number
  isLush: boolean
  overallVerdure: number
}

/** Full stats */
export interface SilverFernStats {
  totalFiles: number
  totalGroves: number
  avgResilienceNature: number
  avgFrondElegance: number
  avgSporeDistribution: number
  avgRhizomeDepth: number
  avgFractalPattern: number
  silverKoruCount: number
  lushFrondCount: number
  properFernCount: number
  wiltedFrondCount: number
  brownLeafCount: number
  deadSporeCount: number
  hasHighResilienceCount: number
  hasHighEleganceCount: number
  hasHighDistributionCount: number
  hasHighDepthCount: number
  hasHighPatternCount: number
  overallVerdure: number
  botanistGrade: BotanistGrade
  bestFrond: string
  mostResilient: string
  mostElegant: string
  bestDistributed: string
  deepestRooted: string
}

/** Full result */
export interface SilverFernResult {
  fronds: FernFrond[]
  groves: FernGrove[]
  forest: ForestSummary
  stats: SilverFernStats
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
 * Measure resilience nature (enduring)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.grade) // 'ancient-fern'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasErrorRecovery = hasTryCatch(content) && hasReturnType(content)
  const hasGracefulDegradation = hasOptional(content) && hasDefaultParam(content)
  const hasDefensiveCoding = hasStrictEq(content) && hasNullishCoalescing(content)
  const hasRetryMechanism = hasAsync(content) && hasTryCatch(content)
  const hasFallbackPaths = hasOptional(content) && hasNullishCoalescing(content)
  const hasSelfHealing = hasTryCatch(content) && hasNullishCoalescing(content)

  score += hasErrorRecovery ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasDefensiveCoding ? 5 : 0
  score += hasRetryMechanism ? 5 : 0
  score += hasFallbackPaths ? 5 : 0
  score += hasSelfHealing ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\beval\b/, content)
  const assumptionCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoAssumption = assumptionCount === 0
  const hasNoSingleFail = !has(/\bvar\b/, content)
  const hasNoDeadEnd = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let grade: ResilienceGrade
  if (resilience >= 85) grade = 'ancient-fern'
  else if (resilience >= 70) grade = 'hardy-survivor'
  else if (resilience >= 55) grade = 'proper-resilience'
  else if (resilience >= 40) grade = 'fragile-frond'
  else if (resilience >= 25) grade = 'wilting-leaf'
  else grade = 'dead-frond'

  return {
    resilience, grade, hasHighResilience, hasErrorRecovery, hasGracefulDegradation,
    hasNoBareCrash, hasDefensiveCoding, hasNoAssumption, hasRetryMechanism,
    hasNoSingleFail, hasFallbackPaths, hasNoDeadEnd, hasSelfHealing,
    bareCrashCount, assumptionCount,
  }
}

/**
 * Measure frond elegance (unfurling)
 * @example
 * const m = measureUnfurling(content)
 * console.log(m.frond) // 'koru-masterpiece'
 */
export function measureUnfurling(content: string): UnfurlingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasReadable = hasDocComments(content) && hasReturnType(content)
  const hasWellFormatted = hasConst(content) && hasStrictEq(content)
  const hasDescriptive = hasNamedExport(content) && hasDocComments(content)
  const hasConsistent = hasExport(content) && hasImport(content)
  const hasSpacious = hasOptional(content) && hasReadonly(content)
  const hasBeautiful = hasInterface(content) && hasGenerics(content)

  score += hasReadable ? 5 : 0
  score += hasWellFormatted ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasSpacious ? 5 : 0
  score += hasBeautiful ? 5 : 0

  const elegance = Math.min(score, 100)
  const denseCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoDense = denseCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoInconsistent = !has(/\beval\b/, content)
  const hasNoCluttered = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let frond: FrondGrade
  if (elegance >= 85) frond = 'koru-masterpiece'
  else if (elegance >= 70) frond = 'elegant-unfurl'
  else if (elegance >= 55) frond = 'proper-frond'
  else if (elegance >= 40) frond = 'curled-leaf'
  else if (elegance >= 25) frond = 'wilted-frond'
  else frond = 'no-frond'

  return {
    elegance, frond, hasHighElegance, hasReadable, hasWellFormatted, hasNoDense,
    hasDescriptive, hasNoCryptic, hasConsistent, hasNoInconsistent, hasSpacious,
    hasNoCluttered, hasBeautiful, denseCount, crypticCount,
  }
}

/**
 * Measure spore distribution (dispersing)
 * @example
 * const m = measureDispersing(content)
 * console.log(m.spore) // 'wind-carried'
 */
export function measureDispersing(content: string): DispersingMeasure {
  let score = 0
  score += hasExport(content) ? 12 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasReusedPatterns = hasExport(content) && hasImport(content)
  const hasSharedUtilities = hasInterface(content) && hasConst(content)
  const hasExported = hasNamedExport(content) && hasReturnType(content)
  const hasDocumented = hasDocComments(content) && hasNamedExport(content)
  const hasAccessible = hasExport(content) && hasGenerics(content)
  const hasComposable = hasInterface(content) && hasGenerics(content)

  score += hasReusedPatterns ? 5 : 0
  score += hasSharedUtilities ? 5 : 0
  score += hasExported ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasAccessible ? 5 : 0
  score += hasComposable ? 5 : 0

  const distribution = Math.min(score, 100)
  const duplicatedCount = countMatches(/\bvar\b/, content)
  const privateOnlyCount = countMatches(/\bany\b/, content)

  const hasNoDuplicated = duplicatedCount === 0
  const hasNoPrivateOnly = privateOnlyCount === 0
  const hasNoUndocumented = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighDistribution = distribution >= 70

  let spore: SporeGrade
  if (distribution >= 85) spore = 'wind-carried'
  else if (distribution >= 70) spore = 'wide-spread'
  else if (distribution >= 55) spore = 'proper-distribution'
  else if (distribution >= 40) spore = 'limited-range'
  else if (distribution >= 25) spore = 'dropped-locally'
  else spore = 'no-spore'

  return {
    distribution, spore, hasHighDistribution, hasReusedPatterns, hasSharedUtilities,
    hasNoDuplicated, hasExported, hasNoPrivateOnly, hasDocumented, hasNoUndocumented,
    hasAccessible, hasNoHidden, hasComposable, duplicatedCount, privateOnlyCount,
  }
}

/**
 * Measure rhizome depth (rooting)
 * @example
 * const m = measureRooting(content)
 * console.log(m.rhizome) // 'deep-network'
 */
export function measureRooting(content: string): RootingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasTestedCore = hasTryCatch(content) && hasReturnType(content)
  const hasTypedFoundation = hasInterface(content) && hasTypeAlias(content)
  const hasStableBase = hasConst(content) && hasReadonly(content)
  const hasWellStructured = hasExport(content) && hasImport(content)
  const hasVerified = hasDocComments(content) && hasReturnType(content)
  const hasSolid = hasGenerics(content) && hasInterface(content)

  score += hasTestedCore ? 5 : 0
  score += hasTypedFoundation ? 5 : 0
  score += hasStableBase ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasVerified ? 5 : 0
  score += hasSolid ? 5 : 0

  const depth = Math.min(score, 100)
  const untypedCount = countMatches(/\bvar\b/, content)
  const shakyBaseCount = countMatches(/\bany\b/, content)

  const hasNoUntyped = untypedCount === 0
  const hasNoShakyBase = shakyBaseCount === 0
  const hasNoChaotic = !has(/\beval\b/, content)
  const hasNoUnverified = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let rhizome: RhizomeGrade
  if (depth >= 85) rhizome = 'deep-network'
  else if (depth >= 70) rhizome = 'strong-rhizome'
  else if (depth >= 55) rhizome = 'proper-roots'
  else if (depth >= 40) rhizome = 'shallow-roots'
  else if (depth >= 25) rhizome = 'surface-root'
  else rhizome = 'no-rhizome'

  return {
    depth, rhizome, hasHighDepth, hasTestedCore, hasTypedFoundation, hasNoUntyped,
    hasStableBase, hasNoShakyBase, hasWellStructured, hasNoChaotic, hasVerified,
    hasNoUnverified, hasSolid, untypedCount, shakyBaseCount,
  }
}

/**
 * Measure fractal pattern (spiraling)
 * @example
 * const m = measureSpiraling(content)
 * console.log(m.fractal) // 'golden-spiral'
 */
export function measureSpiraling(content: string): SpiralingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasConsistentStyle = hasExport(content) && hasImport(content)
  const hasUniformConventions = hasConst(content) && hasStrictEq(content)
  const hasRepeatedPatterns = hasNamedExport(content) && hasReturnType(content)
  const hasPredictable = hasInterface(content) && hasReturnType(content)
  const hasSystematic = hasGenerics(content) && hasConst(content)
  const hasRegular = hasDocComments(content) && hasNamedExport(content)

  score += hasConsistentStyle ? 5 : 0
  score += hasUniformConventions ? 5 : 0
  score += hasRepeatedPatterns ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasRegular ? 5 : 0

  const pattern = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const randomVariationCount = countMatches(/\bany\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoRandomVariation = randomVariationCount === 0
  const hasNoSurprises = !has(/\beval\b/, content)
  const hasNoAdhoc = !has(/\bdebugger\b/, content)
  const hasHighPattern = pattern >= 70

  let fractal: FractalGrade
  if (pattern >= 85) fractal = 'golden-spiral'
  else if (pattern >= 70) fractal = 'proper-fractal'
  else if (pattern >= 55) fractal = 'self-similar'
  else if (pattern >= 40) fractal = 'partial-pattern'
  else if (pattern >= 25) fractal = 'irregular'
  else fractal = 'no-pattern'

  return {
    pattern, fractal, hasHighPattern, hasConsistentStyle, hasUniformConventions,
    hasNoMixed, hasRepeatedPatterns, hasNoRandomVariation, hasPredictable,
    hasNoSurprises, hasSystematic, hasNoAdhoc, hasRegular,
    mixedCount, randomVariationCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify frond condition
 * @example
 * classifyFrondCondition(90) // 'silver-koru'
 */
export function classifyFrondCondition(score: number): FrondCondition {
  if (score >= 85) return 'silver-koru'
  if (score >= 70) return 'lush-frond'
  if (score >= 55) return 'proper-fern'
  if (score >= 40) return 'wilted-frond'
  if (score >= 25) return 'brown-leaf'
  return 'dead-spore'
}

/**
 * Classify grove type
 * @example
 * classifyGroveType(fronds) // 'ancient-forest'
 */
export function classifyGroveType(fronds: FernFrond[]): GroveType {
  if (fronds.length === 0) return 'no-grove'
  if (fronds.length === 1) return 'single-frond'
  const avgQs = Math.round(fronds.reduce((s, f) => s + f.qualityScore, 0) / fronds.length)
  const koruRatio = fronds.filter(f => f.condition === 'silver-koru').length / fronds.length
  if (avgQs >= 75 && koruRatio >= 0.5) return 'ancient-forest'
  if (avgQs >= 60) return 'silver-grove'
  if (avgQs >= 45) return 'proper-fernery'
  if (avgQs >= 30) return 'small-patch'
  return 'no-grove'
}

/**
 * Classify grove condition
 * @example
 * classifyGroveCondition(80) // 'primeval-forest'
 */
export function classifyGroveCondition(avgQs: number): GroveCondition {
  if (avgQs >= 75) return 'primeval-forest'
  if (avgQs >= 60) return 'lush-rainforest'
  if (avgQs >= 45) return 'decent-grove'
  if (avgQs >= 30) return 'sparse-patch'
  if (avgQs >= 15) return 'barren-ground'
  return 'void'
}

/**
 * Classify botanist grade
 * @example
 * classifyBotanistGrade(85) // 'master-botanist'
 */
export function classifyBotanistGrade(avgVerdure: number): BotanistGrade {
  if (avgVerdure >= 80) return 'master-botanist'
  if (avgVerdure >= 65) return 'expert-horticulturist'
  if (avgVerdure >= 50) return 'skilled-gardener'
  if (avgVerdure >= 35) return 'apprentice'
  if (avgVerdure >= 20) return 'novice'
  return 'withered'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(fronds, groves, forest, stats)
 */
export function generateRecommendations(
  fronds: FernFrond[],
  groves: FernGrove[],
  forest: ForestSummary,
  stats: SilverFernStats,
): string[] {
  const recs: string[] = []
  if (stats.avgResilienceNature < 50) {
    recs.push('Strengthen resilience nature with error recovery, graceful degradation, and defensive coding patterns')
  }
  if (stats.avgFrondElegance < 50) {
    recs.push('Unfurl frond elegance with documented exports, readable naming, and consistent formatting')
  }
  if (stats.avgSporeDistribution < 50) {
    recs.push('Improve spore distribution with shared utilities, exported interfaces, and documented patterns')
  }
  if (stats.avgRhizomeDepth < 50) {
    recs.push('Deepen rhizome foundations with typed interfaces, stable bases, and well-structured modules')
  }
  if (stats.avgFractalPattern < 50) {
    recs.push('Enhance fractal patterns with consistent style, uniform conventions, and repeated design patterns')
  }
  if (stats.deadSporeCount > 0) {
    recs.push(`${stats.deadSporeCount} file(s) are dead spores — they need fern restoration`)
  }
  if (forest.overallVerdure < 40) {
    recs.push('Overall verdure is poor — focus on resilience nature and frond elegance first')
  }
  const allBarren = groves.every(g => g.groveType === 'no-grove' || g.groveType === 'single-frond')
  if (allBarren && groves.length > 0) {
    recs.push('All groves are barren — consider a major botanical redesign')
  }
  const deadFiles = fronds.filter(f => f.condition === 'dead-spore').map(f => f.file)
  if (deadFiles.length > 0 && deadFiles.length <= 3) {
    recs.push(`Revive these dead spores into silver koru: ${deadFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your silver fern forest thrives at master botanist quality! Every frond unfurls with koru elegance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as fern frond
 * @example
 * const f = analyzeFernFrond(content, 'index.ts')
 * console.log(f.condition) // 'silver-koru'
 */
export function analyzeFernFrond(content: string, filePath: string): FernFrond {
  const enduring = measureEnduring(content)
  const unfurling = measureUnfurling(content)
  const dispersing = measureDispersing(content)
  const rooting = measureRooting(content)
  const spiraling = measureSpiraling(content)

  const qualityScore = Math.round(
    enduring.resilience * 0.2 +
    unfurling.elegance * 0.2 +
    dispersing.distribution * 0.2 +
    rooting.depth * 0.2 +
    spiraling.pattern * 0.2,
  )

  return {
    file: filePath,
    resilienceNature: enduring.resilience,
    frondElegance: unfurling.elegance,
    sporeDistribution: dispersing.distribution,
    rhizomeDepth: rooting.depth,
    fractalPattern: spiraling.pattern,
    enduring,
    unfurling,
    dispersing,
    rooting,
    spiraling,
    condition: classifyFrondCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as fern grove
 * @example
 * const g = analyzeFernGrove(fronds, 'src')
 * console.log(g.groveType) // 'ancient-forest'
 */
export function analyzeFernGrove(fronds: FernFrond[], dirPath: string): FernGrove {
  if (fronds.length === 0) {
    return {
      directory: dirPath, fronds: [], avgResilience: 0, avgElegance: 0, avgPattern: 0,
      silverKoruCount: 0, deadSporeCount: 0, groveType: 'no-grove', condition: 'void',
    }
  }

  const avgResilience = Math.round(fronds.reduce((s, f) => s + f.resilienceNature, 0) / fronds.length)
  const avgElegance = Math.round(fronds.reduce((s, f) => s + f.frondElegance, 0) / fronds.length)
  const avgPattern = Math.round(fronds.reduce((s, f) => s + f.fractalPattern, 0) / fronds.length)
  const silverKoruCount = fronds.filter(f => f.condition === 'silver-koru').length
  const deadSporeCount = fronds.filter(f => f.condition === 'dead-spore').length
  const avgQs = Math.round(fronds.reduce((s, f) => s + f.qualityScore, 0) / fronds.length)

  return {
    directory: dirPath, fronds, avgResilience, avgElegance, avgPattern,
    silverKoruCount, deadSporeCount, groveType: classifyGroveType(fronds),
    condition: classifyGroveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete silver fern result
 * @example
 * const result = await buildSilverFernResult(files, contents)
 * console.log(result.stats.botanistGrade) // 'master-botanist'
 */
export async function buildSilverFernResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverFernResult> {
  const fronds = files.map((file, i) => analyzeFernFrond(contents[i] ?? '', file))

  const dirMap = new Map<string, FernFrond[]>()
  for (const frond of fronds) {
    const dir = path.dirname(frond.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(frond) } else { dirMap.set(dir, [frond]) }
  }

  const groves = Array.from(dirMap.entries()).map(([dir, dirFronds]) =>
    analyzeFernGrove(dirFronds, dir),
  )

  const avgResilience = fronds.length > 0
    ? Math.round(fronds.reduce((s, f) => s + f.resilienceNature, 0) / fronds.length) : 0
  const avgElegance = fronds.length > 0
    ? Math.round(fronds.reduce((s, f) => s + f.frondElegance, 0) / fronds.length) : 0
  const avgPattern = fronds.length > 0
    ? Math.round(fronds.reduce((s, f) => s + f.fractalPattern, 0) / fronds.length) : 0

  const overallVerdure = fronds.length > 0
    ? Math.round((avgResilience + avgElegance + avgPattern) / 3) : 0
  const isLush = avgResilience >= 60

  const forest: ForestSummary = { avgResilience, avgElegance, avgPattern, isLush, overallVerdure }

  const avgSporeDistribution = fronds.length > 0
    ? Math.round(fronds.reduce((s, f) => s + f.sporeDistribution, 0) / fronds.length) : 0
  const avgRhizomeDepth = fronds.length > 0
    ? Math.round(fronds.reduce((s, f) => s + f.rhizomeDepth, 0) / fronds.length) : 0
  const avgFractalPattern = avgPattern

  const bestFrond = fronds.length > 0
    ? fronds.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const mostResilient = fronds.length > 0
    ? fronds.reduce((best, f) => f.resilienceNature > best.resilienceNature ? f : best).file : ''
  const mostElegant = fronds.length > 0
    ? fronds.reduce((best, f) => f.frondElegance > best.frondElegance ? f : best).file : ''
  const bestDistributed = fronds.length > 0
    ? fronds.reduce((best, f) => f.sporeDistribution > best.sporeDistribution ? f : best).file : ''
  const deepestRooted = fronds.length > 0
    ? fronds.reduce((best, f) => f.rhizomeDepth > best.rhizomeDepth ? f : best).file : ''

  const stats: SilverFernStats = {
    totalFiles: fronds.length,
    totalGroves: groves.length,
    avgResilienceNature: avgResilience,
    avgFrondElegance: avgElegance,
    avgSporeDistribution,
    avgRhizomeDepth,
    avgFractalPattern,
    silverKoruCount: fronds.filter(f => f.condition === 'silver-koru').length,
    lushFrondCount: fronds.filter(f => f.condition === 'lush-frond').length,
    properFernCount: fronds.filter(f => f.condition === 'proper-fern').length,
    wiltedFrondCount: fronds.filter(f => f.condition === 'wilted-frond').length,
    brownLeafCount: fronds.filter(f => f.condition === 'brown-leaf').length,
    deadSporeCount: fronds.filter(f => f.condition === 'dead-spore').length,
    hasHighResilienceCount: fronds.filter(f => f.enduring.hasHighResilience).length,
    hasHighEleganceCount: fronds.filter(f => f.unfurling.hasHighElegance).length,
    hasHighDistributionCount: fronds.filter(f => f.dispersing.hasHighDistribution).length,
    hasHighDepthCount: fronds.filter(f => f.rooting.hasHighDepth).length,
    hasHighPatternCount: fronds.filter(f => f.spiraling.hasHighPattern).length,
    overallVerdure,
    botanistGrade: classifyBotanistGrade(overallVerdure),
    bestFrond, mostResilient, mostElegant, bestDistributed, deepestRooted,
  }

  const recommendations = generateRecommendations(fronds, groves, forest, stats)

  return { fronds, groves, forest, stats, recommendations }
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
