// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type WisdomGrade = 'ancient-sovereign' | 'elder-king' | 'proper-wisdom' | 'young-ruler' | 'naive-heir' | 'no-wisdom'
export type CorrosionGrade = 'stainless-steel' | 'rust-resistant' | 'proper-coating' | 'surface-rust' | 'deep-corrosion' | 'dissolved'
export type GildingGrade = 'pure-gold' | 'silver-lining' | 'proper-gilt' | 'worn-gold' | 'tarnished' | 'no-gilding'
export type ReignGrade = 'eternal-kingdom' | 'stable-reign' | 'proper-rule' | 'turbulent-era' | 'collapsing-reign' | 'no-reign'
export type CoronationGrade = 'ready-to-crown' | 'heir-apparent' | 'proper-succession' | 'uncertain-succession' | 'no-heir' | 'no-throne'
export type JewelCondition = 'golden-crown' | 'silver-diadem' | 'proper-tiara' | 'rusted-circlet' | 'broken-crown' | 'scrap-metal'
export type CourtType = 'grand-palace' | 'royal-court' | 'proper-hall' | 'small-throne' | 'ruined-castle' | 'no-court'
export type CourtCondition = 'imperial-palace' | 'royal-court' | 'decent-hall' | 'humble-throne' | 'ruin' | 'void'
export type MonarchGrade = 'emperor' | 'king' | 'duke' | 'baron' | 'knight' | 'peasant'

export interface RememberingMeasure {
  wisdom: number
  grade: WisdomGrade
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasCommented: boolean
  hasNoSilent: boolean
  hasDescriptive: boolean
  hasNoVague: boolean
  hasHistorical: boolean
  hasNoUnexplained: boolean
  hasPreserved: boolean
  crypticCount: number
  silentCount: number
}

export interface ResistingMeasure {
  resistance: number
  corrosion: CorrosionGrade
  hasHighResistance: boolean
  hasModernized: boolean
  hasUpdatedDeps: boolean
  hasNoOutdated: boolean
  hasRefactored: boolean
  hasNoLegacyPatterns: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCurrent: boolean
  outdatedCount: number
  legacyPatternCount: number
}

export interface GleamingMeasure {
  quality: number
  gilding: GildingGrade
  hasHighQuality: boolean
  hasHighValue: boolean
  hasCleanCode: boolean
  hasNoDeadCode: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasValuable: boolean
  deadCodeCount: number
  fillerCount: number
}

export interface StabilizingMeasure {
  stability: number
  reign: ReignGrade
  hasHighStability: boolean
  hasConsistentAPI: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingInterfaces: boolean
  hasTested: boolean
  hasNoRegressions: boolean
  hasDependable: boolean
  hasNoVolatile: boolean
  breakingChangesCount: number
  unversionedCount: number
}

export interface PreparingMeasure {
  readiness: number
  coronation: CoronationGrade
  hasHighReadiness: boolean
  hasExtensible: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasDocumented: boolean
  hasNoTribalKnowledge: boolean
  hasCleanInterfaces: boolean
  hasNoCoupled: boolean
  hasSuccessionPlan: boolean
  hasNoSinglePoint: boolean
  hasHandoffReady: boolean
  monolithicCount: number
  tribalKnowledgeCount: number
}

export interface CrownJewel {
  file: string
  legacyWisdom: number
  corrosionResistance: number
  gildedQuality: number
  reignStability: number
  coronationReadiness: number
  remembering: RememberingMeasure
  resisting: ResistingMeasure
  gleaming: GleamingMeasure
  stabilizing: StabilizingMeasure
  preparing: PreparingMeasure
  condition: JewelCondition
  qualityScore: number
}

export interface RoyalCourt {
  directory: string
  jewels: CrownJewel[]
  avgWisdom: number
  avgStability: number
  avgReadiness: number
  goldenCrownCount: number
  scrapMetalCount: number
  courtType: CourtType
  condition: CourtCondition
}

export interface KingdomSummary {
  avgWisdom: number
  avgStability: number
  avgReadiness: number
  isSovereign: boolean
  overallSovereignty: number
}

export interface RustedCrownStats {
  totalFiles: number
  totalCourts: number
  avgLegacyWisdom: number
  avgCorrosionResistance: number
  avgGildedQuality: number
  avgReignStability: number
  avgCoronationReadiness: number
  goldenCrownCount: number
  silverDiademCount: number
  properTiaraCount: number
  rustedCircletCount: number
  brokenCrownCount: number
  scrapMetalCount: number
  hasHighWisdomCount: number
  hasHighResistanceCount: number
  hasHighQualityCount: number
  hasHighStabilityCount: number
  hasHighReadinessCount: number
  overallSovereignty: number
  monarchGrade: MonarchGrade
  bestJewel: string
  wisest: string
  mostResistant: string
  highestQuality: string
  mostStable: string
}

export interface RustedCrownResult {
  jewels: CrownJewel[]
  courts: RoyalCourt[]
  kingdom: KingdomSummary
  stats: RustedCrownStats
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

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure legacy wisdom (remembering)
 * @example
 * const m = measureRemembering(content)
 * console.log(m.grade) // 'ancient-sovereign'
 */
export function measureRemembering(content: string): RememberingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasWellNamed = hasNamedExport(content) && hasInterface(content)
  const hasCommented = hasExport(content) && hasImport(content)
  const hasDescriptive = hasGenerics(content) && hasTypeAlias(content)
  const hasHistorical = hasEnum(content) && hasUnionType(content)
  const hasPreserved = hasReadonly(content) && hasConst(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasCommented ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasHistorical ? 5 : 0
  score += hasPreserved ? 5 : 0

  const wisdom = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const silentCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoSilent = silentCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoUnexplained = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let grade: WisdomGrade
  if (wisdom >= 85) grade = 'ancient-sovereign'
  else if (wisdom >= 70) grade = 'elder-king'
  else if (wisdom >= 55) grade = 'proper-wisdom'
  else if (wisdom >= 40) grade = 'young-ruler'
  else if (wisdom >= 25) grade = 'naive-heir'
  else grade = 'no-wisdom'

  return {
    wisdom, grade, hasHighWisdom, hasDocumented, hasWellNamed, hasNoCryptic,
    hasCommented, hasNoSilent, hasDescriptive, hasNoVague, hasHistorical,
    hasNoUnexplained, hasPreserved, crypticCount, silentCount,
  }
}

/**
 * Measure corrosion resistance (resisting)
 * @example
 * const m = measureResisting(content)
 * console.log(m.corrosion) // 'stainless-steel'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0

  const hasModernized = hasAsync(content) && hasArrowFunction(content)
  const hasUpdatedDeps = hasImport(content) && hasExport(content)
  const hasRefactored = hasConst(content) && hasStrictEq(content)
  const hasTypeSafe = hasInterface(content) && hasReturnType(content)
  const hasTested = hasTryCatch(content) && hasStrictEq(content)
  const hasCurrent = hasEnum(content) && hasUnionType(content)

  score += hasModernized ? 5 : 0
  score += hasUpdatedDeps ? 5 : 0
  score += hasRefactored ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasCurrent ? 5 : 0

  const resistance = Math.min(score, 100)
  const outdatedCount = countMatches(/\bvar\b/, content)
  const legacyPatternCount = countMatches(/\bany\b/, content)

  const hasNoOutdated = outdatedCount === 0
  const hasNoLegacyPatterns = legacyPatternCount === 0
  const hasNoUnsafe = !has(/\beval\b/, content)
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let corrosion: CorrosionGrade
  if (resistance >= 85) corrosion = 'stainless-steel'
  else if (resistance >= 70) corrosion = 'rust-resistant'
  else if (resistance >= 55) corrosion = 'proper-coating'
  else if (resistance >= 40) corrosion = 'surface-rust'
  else if (resistance >= 25) corrosion = 'deep-corrosion'
  else corrosion = 'dissolved'

  return {
    resistance, corrosion, hasHighResistance, hasModernized, hasUpdatedDeps,
    hasNoOutdated, hasRefactored, hasNoLegacyPatterns, hasTypeSafe, hasNoUnsafe,
    hasTested, hasNoUntested, hasCurrent, outdatedCount, legacyPatternCount,
  }
}

/**
 * Measure gilded quality (gleaming)
 * @example
 * const m = measureGleaming(content)
 * console.log(m.gilding) // 'pure-gold'
 */
export function measureGleaming(content: string): GleamingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasHighValue = hasDocComments(content) && hasReturnType(content)
  const hasCleanCode = hasConst(content) && hasStrictEq(content)
  const hasEssential = hasExport(content) && hasImport(content)
  const hasPolished = hasNamedExport(content) && hasInterface(content)
  const hasRefined = hasGenerics(content) && hasTypeAlias(content)
  const hasValuable = hasMapFunction(content) && hasArrowFunction(content)

  score += hasHighValue ? 5 : 0
  score += hasCleanCode ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasValuable ? 5 : 0

  const quality = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const fillerCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoFiller = fillerCount === 0
  const hasNoRough = !has(/\beval\b/, content)
  const hasNoCrude = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let gilding: GildingGrade
  if (quality >= 85) gilding = 'pure-gold'
  else if (quality >= 70) gilding = 'silver-lining'
  else if (quality >= 55) gilding = 'proper-gilt'
  else if (quality >= 40) gilding = 'worn-gold'
  else if (quality >= 25) gilding = 'tarnished'
  else gilding = 'no-gilding'

  return {
    quality, gilding, hasHighQuality, hasHighValue, hasCleanCode, hasNoDeadCode,
    hasEssential, hasNoFiller, hasPolished, hasNoRough, hasRefined, hasNoCrude,
    hasValuable, deadCodeCount, fillerCount,
  }
}

/**
 * Measure reign stability (stabilizing)
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.reign) // 'eternal-kingdom'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasConsistentAPI = hasInterface(content) && hasReturnType(content)
  const hasVersioned = hasEnum(content) && hasUnionType(content)
  const hasBackwardCompatible = hasOptional(content) && hasReadonly(content)
  const hasTested = hasTryCatch(content) && hasStrictEq(content)
  const hasDependable = hasExport(content) && hasImport(content)
  const hasNoBreakingInterfaces = hasInterface(content) && hasConst(content)

  score += hasConsistentAPI ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasBackwardCompatible ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasDependable ? 5 : 0
  score += hasNoBreakingInterfaces ? 5 : 0

  const stability = Math.min(score, 100)
  const breakingChangesCount = countMatches(/\bvar\b/, content)
  const unversionedCount = countMatches(/\bany\b/, content)

  const hasNoBreakingChanges = breakingChangesCount === 0
  const hasNoUnversioned = unversionedCount === 0
  const hasNoRegressions = !has(/\beval\b/, content)
  const hasNoVolatile = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let reign: ReignGrade
  if (stability >= 85) reign = 'eternal-kingdom'
  else if (stability >= 70) reign = 'stable-reign'
  else if (stability >= 55) reign = 'proper-rule'
  else if (stability >= 40) reign = 'turbulent-era'
  else if (stability >= 25) reign = 'collapsing-reign'
  else reign = 'no-reign'

  return {
    stability, reign, hasHighStability, hasConsistentAPI, hasNoBreakingChanges,
    hasVersioned, hasNoUnversioned, hasBackwardCompatible, hasNoBreakingInterfaces,
    hasTested, hasNoRegressions, hasDependable, hasNoVolatile, breakingChangesCount,
    unversionedCount,
  }
}

/**
 * Measure coronation readiness (preparing)
 * @example
 * const m = measurePreparing(content)
 * console.log(m.coronation) // 'ready-to-crown'
 */
export function measurePreparing(content: string): PreparingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasExtensible = hasInterface(content) && hasGenerics(content)
  const hasModular = hasExport(content) && hasImport(content)
  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasCleanInterfaces = hasInterface(content) && hasNamedExport(content)
  const hasSuccessionPlan = hasAsync(content) && hasMapFunction(content)
  const hasHandoffReady = hasOptional(content) && hasDefaultParam(content)

  score += hasExtensible ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasCleanInterfaces ? 5 : 0
  score += hasSuccessionPlan ? 5 : 0
  score += hasHandoffReady ? 5 : 0

  const readiness = Math.min(score, 100)
  const monolithicCount = countMatches(/\bvar\b/, content)
  const tribalKnowledgeCount = countMatches(/\bany\b/, content)

  const hasNoMonolithic = monolithicCount === 0
  const hasNoTribalKnowledge = tribalKnowledgeCount === 0
  const hasNoCoupled = !has(/\beval\b/, content)
  const hasNoSinglePoint = !has(/\bdebugger\b/, content)
  const hasHighReadiness = readiness >= 70

  let coronation: CoronationGrade
  if (readiness >= 85) coronation = 'ready-to-crown'
  else if (readiness >= 70) coronation = 'heir-apparent'
  else if (readiness >= 55) coronation = 'proper-succession'
  else if (readiness >= 40) coronation = 'uncertain-succession'
  else if (readiness >= 25) coronation = 'no-heir'
  else coronation = 'no-throne'

  return {
    readiness, coronation, hasHighReadiness, hasExtensible, hasModular,
    hasNoMonolithic, hasDocumented, hasNoTribalKnowledge, hasCleanInterfaces,
    hasNoCoupled, hasSuccessionPlan, hasNoSinglePoint, hasHandoffReady,
    monolithicCount, tribalKnowledgeCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify jewel condition
 * @example
 * classifyJewelCondition(90) // 'golden-crown'
 */
export function classifyJewelCondition(score: number): JewelCondition {
  if (score >= 85) return 'golden-crown'
  if (score >= 70) return 'silver-diadem'
  if (score >= 55) return 'proper-tiara'
  if (score >= 40) return 'rusted-circlet'
  if (score >= 25) return 'broken-crown'
  return 'scrap-metal'
}

/**
 * Classify court type
 * @example
 * classifyCourtType(jewels) // 'grand-palace'
 */
export function classifyCourtType(jewels: CrownJewel[]): CourtType {
  if (jewels.length === 0) return 'no-court'
  const avgQs = Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length)
  const goldenRatio = jewels.filter(j => j.condition === 'golden-crown').length / jewels.length
  if (avgQs >= 75 && goldenRatio >= 0.5) return 'grand-palace'
  if (avgQs >= 60) return 'royal-court'
  if (avgQs >= 45) return 'proper-hall'
  if (avgQs >= 30) return 'small-throne'
  if (avgQs >= 15) return 'ruined-castle'
  return 'no-court'
}

/**
 * Classify court condition
 * @example
 * classifyCourtCondition(80) // 'imperial-palace'
 */
export function classifyCourtCondition(avgQs: number): CourtCondition {
  if (avgQs >= 75) return 'imperial-palace'
  if (avgQs >= 60) return 'royal-court'
  if (avgQs >= 45) return 'decent-hall'
  if (avgQs >= 30) return 'humble-throne'
  if (avgQs >= 15) return 'ruin'
  return 'void'
}

/**
 * Classify monarch grade
 * @example
 * classifyMonarchGrade(85) // 'emperor'
 */
export function classifyMonarchGrade(avgSovereignty: number): MonarchGrade {
  if (avgSovereignty >= 80) return 'emperor'
  if (avgSovereignty >= 65) return 'king'
  if (avgSovereignty >= 50) return 'duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(jewels, courts, kingdom, stats)
 */
export function generateRecommendations(
  jewels: CrownJewel[],
  courts: RoyalCourt[],
  kingdom: KingdomSummary,
  stats: RustedCrownStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLegacyWisdom < 50) {
    recs.push('Restore legacy wisdom with documentation, descriptive naming, and preserved historical context')
  }
  if (stats.avgCorrosionResistance < 50) {
    recs.push('Strengthen corrosion resistance with modern patterns, type safety, and refactored code')
  }
  if (stats.avgGildedQuality < 50) {
    recs.push('Polish gilded quality with clean code, essential exports, and refined abstractions')
  }
  if (stats.avgReignStability < 50) {
    recs.push('Solidify reign stability with consistent APIs, versioned types, and backward compatibility')
  }
  if (stats.avgCoronationReadiness < 50) {
    recs.push('Prepare for coronation with extensible interfaces, modular architecture, and clean succession')
  }
  if (stats.scrapMetalCount > 0) {
    recs.push(`${stats.scrapMetalCount} file(s) are scrap metal — they need complete crown restoration`)
  }
  if (kingdom.overallSovereignty < 40) {
    recs.push('Overall sovereignty is low — focus on legacy wisdom and reign stability first')
  }
  const allRuined = courts.every(c => c.courtType === 'no-court' || c.courtType === 'ruined-castle')
  if (allRuined && courts.length > 0) {
    recs.push('All courts are ruined — consider a major kingdom reconstruction')
  }
  const scrapFiles = jewels.filter(j => j.condition === 'scrap-metal').map(j => j.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Restore these scrap-metal files: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your rusted crown achieves emperor grade! Every jewel shines with sovereign brilliance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as crown jewel
 * @example
 * const j = analyzeCrownJewel(content, 'index.ts')
 * console.log(j.condition) // 'golden-crown'
 */
export function analyzeCrownJewel(content: string, filePath: string): CrownJewel {
  const remembering = measureRemembering(content)
  const resisting = measureResisting(content)
  const gleaming = measureGleaming(content)
  const stabilizing = measureStabilizing(content)
  const preparing = measurePreparing(content)

  const qualityScore = Math.round(
    remembering.wisdom * 0.2 +
    resisting.resistance * 0.2 +
    gleaming.quality * 0.2 +
    stabilizing.stability * 0.2 +
    preparing.readiness * 0.2,
  )

  return {
    file: filePath,
    legacyWisdom: remembering.wisdom,
    corrosionResistance: resisting.resistance,
    gildedQuality: gleaming.quality,
    reignStability: stabilizing.stability,
    coronationReadiness: preparing.readiness,
    remembering,
    resisting,
    gleaming,
    stabilizing,
    preparing,
    condition: classifyJewelCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as royal court
 * @example
 * const c = analyzeRoyalCourt(jewels, 'src')
 * console.log(c.courtType) // 'grand-palace'
 */
export function analyzeRoyalCourt(jewels: CrownJewel[], dirPath: string): RoyalCourt {
  if (jewels.length === 0) {
    return {
      directory: dirPath, jewels: [], avgWisdom: 0, avgStability: 0,
      avgReadiness: 0, goldenCrownCount: 0, scrapMetalCount: 0,
      courtType: 'no-court', condition: 'void',
    }
  }

  const avgWisdom = Math.round(jewels.reduce((s, j) => s + j.legacyWisdom, 0) / jewels.length)
  const avgStability = Math.round(jewels.reduce((s, j) => s + j.reignStability, 0) / jewels.length)
  const avgReadiness = Math.round(jewels.reduce((s, j) => s + j.coronationReadiness, 0) / jewels.length)
  const goldenCrownCount = jewels.filter(j => j.condition === 'golden-crown').length
  const scrapMetalCount = jewels.filter(j => j.condition === 'scrap-metal').length
  const avgQs = Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length)

  return {
    directory: dirPath, jewels, avgWisdom, avgStability, avgReadiness,
    goldenCrownCount, scrapMetalCount,
    courtType: classifyCourtType(jewels),
    condition: classifyCourtCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete rusted crown result
 * @example
 * const result = await buildRustedCrownResult(files, contents)
 * console.log(result.stats.monarchGrade) // 'emperor'
 */
export async function buildRustedCrownResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RustedCrownResult> {
  const jewels = files.map((file, i) => analyzeCrownJewel(contents[i] ?? '', file))

  const dirMap = new Map<string, CrownJewel[]>()
  for (const jewel of jewels) {
    const dir = path.dirname(jewel.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(jewel) } else { dirMap.set(dir, [jewel]) }
  }

  const courts = Array.from(dirMap.entries()).map(([dir, dirJewels]) =>
    analyzeRoyalCourt(dirJewels, dir),
  )

  const avgWisdom = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.legacyWisdom, 0) / jewels.length) : 0
  const avgStability = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.reignStability, 0) / jewels.length) : 0
  const avgReadiness = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.coronationReadiness, 0) / jewels.length) : 0

  const overallSovereignty = jewels.length > 0
    ? Math.round((avgWisdom + avgStability + avgReadiness) / 3) : 0
  const isSovereign = avgWisdom >= 60

  const kingdom: KingdomSummary = { avgWisdom, avgStability, avgReadiness, isSovereign, overallSovereignty }

  const avgCorrosionResistance = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.corrosionResistance, 0) / jewels.length) : 0
  const avgGildedQuality = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.gildedQuality, 0) / jewels.length) : 0

  const bestJewel = jewels.length > 0
    ? jewels.reduce((best, j) => j.qualityScore > best.qualityScore ? j : best).file : ''
  const wisest = jewels.length > 0
    ? jewels.reduce((best, j) => j.legacyWisdom > best.legacyWisdom ? j : best).file : ''
  const mostResistant = jewels.length > 0
    ? jewels.reduce((best, j) => j.corrosionResistance > best.corrosionResistance ? j : best).file : ''
  const highestQuality = jewels.length > 0
    ? jewels.reduce((best, j) => j.gildedQuality > best.gildedQuality ? j : best).file : ''
  const mostStable = jewels.length > 0
    ? jewels.reduce((best, j) => j.reignStability > best.reignStability ? j : best).file : ''

  const stats: RustedCrownStats = {
    totalFiles: jewels.length,
    totalCourts: courts.length,
    avgLegacyWisdom: avgWisdom,
    avgCorrosionResistance,
    avgGildedQuality,
    avgReignStability: avgStability,
    avgCoronationReadiness: avgReadiness,
    goldenCrownCount: jewels.filter(j => j.condition === 'golden-crown').length,
    silverDiademCount: jewels.filter(j => j.condition === 'silver-diadem').length,
    properTiaraCount: jewels.filter(j => j.condition === 'proper-tiara').length,
    rustedCircletCount: jewels.filter(j => j.condition === 'rusted-circlet').length,
    brokenCrownCount: jewels.filter(j => j.condition === 'broken-crown').length,
    scrapMetalCount: jewels.filter(j => j.condition === 'scrap-metal').length,
    hasHighWisdomCount: jewels.filter(j => j.remembering.hasHighWisdom).length,
    hasHighResistanceCount: jewels.filter(j => j.resisting.hasHighResistance).length,
    hasHighQualityCount: jewels.filter(j => j.gleaming.hasHighQuality).length,
    hasHighStabilityCount: jewels.filter(j => j.stabilizing.hasHighStability).length,
    hasHighReadinessCount: jewels.filter(j => j.preparing.hasHighReadiness).length,
    overallSovereignty,
    monarchGrade: classifyMonarchGrade(overallSovereignty),
    bestJewel, wisest, mostResistant, highestQuality, mostStable,
  }

  const recommendations = generateRecommendations(jewels, courts, kingdom, stats)

  return { jewels, courts, kingdom, stats, recommendations }
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
