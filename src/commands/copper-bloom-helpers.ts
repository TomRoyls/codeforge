// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Patina wisdom grade */
export type PatinaGrade =
  | 'ancient-patina'
  | 'aged-wisdom'
  | 'proper-aging'
  | 'premature-aging'
  | 'raw-copper'
  | 'no-patina'

/** Oxidation resilience grade */
export type OxidationGrade =
  | 'impervious-copper'
  | 'protective-patina'
  | 'proper-coating'
  | 'corroding-surface'
  | 'rusting-metal'
  | 'no-resistance'

/** Conductivity quality grade */
export type ConductivityGrade =
  | 'superconductor'
  | 'high-conductivity'
  | 'proper-flow'
  | 'resistive-wire'
  | 'insulated'
  | 'no-conductivity'

/** Alloy strength grade */
export type AlloyGrade =
  | 'bronze-masterpiece'
  | 'strong-alloy'
  | 'proper-mix'
  | 'weak-bond'
  | 'brittle-composite'
  | 'no-alloy'

/** Verdigris beauty grade */
export type VerdigrisGrade =
  | 'stunning-patina'
  | 'beautiful-green'
  | 'proper-color'
  | 'patchy-surface'
  | 'tarnished-metal'
  | 'no-beauty'

/** Patina condition */
export type PatinaCondition =
  | 'statue-of-liberty'
  | 'aged-masterpiece'
  | 'proper-copper'
  | 'tarnished-metal'
  | 'raw-wire'
  | 'scrap'

/** Forge type */
export type ForgeType =
  | 'grand-foundry'
  | 'proper-forge'
  | 'decent-workshop'
  | 'small-anvil'
  | 'cold-hearth'
  | 'no-forge'

/** Forge condition */
export type ForgeCondition =
  | 'masterwork-forge'
  | 'quality-foundry'
  | 'decent-workshop'
  | 'rusty-shed'
  | 'abandoned'
  | 'void'

/** Smith grade */
export type SmithGrade =
  | 'master-smith'
  | 'expert-forge'
  | 'skilled-craftsman'
  | 'apprentice'
  | 'novice'
  | 'scrap-dealer'

/** Aging (wisdom) measurement */
export interface AgingMeasure {
  wisdom: number
  grade: PatinaGrade
  hasHighWisdom: boolean
  hasRefactored: boolean
  hasIterated: boolean
  hasNoFirstDraft: boolean
  hasMature: boolean
  hasNoImmature: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasRefined: boolean
  firstDraftCount: number
  immatureCount: number
}

/** Resisting (resilience) measurement */
export interface ResistingMeasure {
  resilience: number
  oxidation: OxidationGrade
  hasHighResilience: boolean
  hasErrorHandling: boolean
  hasInputValidation: boolean
  hasNoBareExposure: boolean
  hasDefensiveCode: boolean
  hasNoTrusting: boolean
  hasBoundaryChecks: boolean
  hasNoUnbounded: boolean
  hasTypeSafety: boolean
  hasNoCasts: boolean
  hasProtected: boolean
  bareExposureCount: number
  trustingCount: number
}

/** Conducting (conductivity) measurement */
export interface ConductingMeasure {
  quality: number
  conductivity: ConductivityGrade
  hasHighQuality: boolean
  hasEfficientDataFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoRedundantPaths: boolean
  hasDirectAccess: boolean
  hasNoIndirection: boolean
  hasCached: boolean
  hasNoRecalculating: boolean
  hasOptimized: boolean
  hasNoUnoptimized: boolean
  bottleneckCount: number
  redundantPathCount: number
}

/** Alloying (strength) measurement */
export interface AlloyingMeasure {
  strength: number
  alloy: AlloyGrade
  hasHighStrength: boolean
  hasWellIntegrated: boolean
  hasCleanInterfaces: boolean
  hasNoLeakyAbstractions: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCompatible: boolean
  hasNoVersionConflicts: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCohesive: boolean
  leakyAbstractionCount: number
  monolithicCount: number
}

/** Beautifying (beauty) measurement */
export interface BeautifyingMeasure {
  beauty: number
  verdigris: VerdigrisGrade
  hasHighBeauty: boolean
  hasElegant: boolean
  hasReadable: boolean
  hasNoUgly: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasFormatted: boolean
  hasNoMessy: boolean
  hasGraceful: boolean
  uglyCount: number
  crypticCount: number
}

/** Single file analysis */
export interface CopperPatina {
  file: string
  patinaWisdom: number
  oxidationResilience: number
  conductivityQuality: number
  alloyStrength: number
  verdigrisBeauty: number
  aging: AgingMeasure
  resisting: ResistingMeasure
  conducting: ConductingMeasure
  alloying: AlloyingMeasure
  beautifying: BeautifyingMeasure
  condition: PatinaCondition
  qualityScore: number
}

/** Directory-level forge */
export interface CopperForge {
  directory: string
  patinas: CopperPatina[]
  avgWisdom: number
  avgConductivity: number
  avgStrength: number
  statueOfLibertyCount: number
  scrapCount: number
  forgeType: ForgeType
  condition: ForgeCondition
}

/** Foundry summary */
export interface FoundrySummary {
  avgWisdom: number
  avgConductivity: number
  avgStrength: number
  isMasterwork: boolean
  overallCraftsmanship: number
}

/** Full stats */
export interface CopperBloomStats {
  totalFiles: number
  totalForges: number
  avgPatinaWisdom: number
  avgOxidationResilience: number
  avgConductivityQuality: number
  avgAlloyStrength: number
  avgVerdigrisBeauty: number
  statueOfLibertyCount: number
  agedMasterpieceCount: number
  properCopperCount: number
  tarnishedMetalCount: number
  rawWireCount: number
  scrapCount: number
  hasHighWisdomCount: number
  hasHighResilienceCount: number
  hasHighQualityCount: number
  hasHighStrengthCount: number
  hasHighBeautyCount: number
  overallCraftsmanship: number
  smithGrade: SmithGrade
  bestPatina: string
  wisest: string
  mostResilient: string
  bestConductor: string
  strongest: string
}

/** Full result */
export interface CopperBloomResult {
  patinas: CopperPatina[]
  forges: CopperForge[]
  foundry: FoundrySummary
  stats: CopperBloomStats
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
 * Measure patina wisdom (aging)
 * @example
 * const m = measureAging(content)
 * console.log(m.grade) // 'ancient-patina'
 */
export function measureAging(content: string): AgingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasRefactored = hasDocComments(content) && hasReturnType(content)
  const hasIterated = hasInterface(content) && hasGenerics(content)
  const hasMature = hasReadonly(content) && hasConst(content)
  const hasPolished = hasNamedExport(content) && hasReturnType(content)
  const hasEvolved = hasExport(content) && hasImport(content)
  const hasRefined = hasGenerics(content) && hasInterface(content)

  score += hasRefactored ? 5 : 0
  score += hasIterated ? 5 : 0
  score += hasMature ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasEvolved ? 5 : 0
  score += hasRefined ? 5 : 0

  const wisdom = Math.min(score, 100)
  const firstDraftCount = countMatches(/\bvar\b/, content)
  const immatureCount = countMatches(/\bany\b/, content)

  const hasNoFirstDraft = firstDraftCount === 0
  const hasNoImmature = immatureCount === 0
  const hasNoRough = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let grade: PatinaGrade
  if (wisdom >= 85) grade = 'ancient-patina'
  else if (wisdom >= 70) grade = 'aged-wisdom'
  else if (wisdom >= 55) grade = 'proper-aging'
  else if (wisdom >= 40) grade = 'premature-aging'
  else if (wisdom >= 25) grade = 'raw-copper'
  else grade = 'no-patina'

  return {
    wisdom, grade, hasHighWisdom, hasRefactored, hasIterated, hasNoFirstDraft,
    hasMature, hasNoImmature, hasPolished, hasNoRough, hasEvolved, hasNoStatic,
    hasRefined, firstDraftCount, immatureCount,
  }
}

/**
 * Measure oxidation resilience (resisting)
 * @example
 * const m = measureResisting(content)
 * console.log(m.oxidation) // 'impervious-copper'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasErrorHandling = hasTryCatch(content) && hasReturnType(content)
  const hasInputValidation = hasStrictEq(content) && hasOptional(content)
  const hasDefensiveCode = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasBoundaryChecks = hasOptional(content) && hasNullishCoalescing(content)
  const hasTypeSafety = hasInterface(content) && hasReturnType(content)
  const hasProtected = hasPrivate(content) && hasReadonly(content)

  score += hasErrorHandling ? 5 : 0
  score += hasInputValidation ? 5 : 0
  score += hasDefensiveCode ? 5 : 0
  score += hasBoundaryChecks ? 5 : 0
  score += hasTypeSafety ? 5 : 0
  score += hasProtected ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareExposureCount = countMatches(/\bvar\b/, content)
  const trustingCount = countMatches(/\bany\b/, content)

  const hasNoBareExposure = bareExposureCount === 0
  const hasNoTrusting = trustingCount === 0
  const hasNoUnbounded = !has(/\beval\b/, content)
  const hasNoCasts = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let oxidation: OxidationGrade
  if (resilience >= 85) oxidation = 'impervious-copper'
  else if (resilience >= 70) oxidation = 'protective-patina'
  else if (resilience >= 55) oxidation = 'proper-coating'
  else if (resilience >= 40) oxidation = 'corroding-surface'
  else if (resilience >= 25) oxidation = 'rusting-metal'
  else oxidation = 'no-resistance'

  return {
    resilience, oxidation, hasHighResilience, hasErrorHandling, hasInputValidation,
    hasNoBareExposure, hasDefensiveCode, hasNoTrusting, hasBoundaryChecks,
    hasNoUnbounded, hasTypeSafety, hasNoCasts, hasProtected,
    bareExposureCount, trustingCount,
  }
}

/**
 * Measure conductivity quality (conducting)
 * @example
 * const m = measureConducting(content)
 * console.log(m.conductivity) // 'superconductor'
 */
export function measureConducting(content: string): ConductingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasEfficientDataFlow = hasExport(content) && hasImport(content)
  const hasStreamlined = hasConst(content) && hasReturnType(content)
  const hasDirectAccess = hasInterface(content) && hasNamedExport(content)
  const hasCached = hasGenerics(content) && hasConst(content)
  const hasOptimized = hasAsync(content) && hasReturnType(content)
  const hasNoRedundantPaths = hasExport(content) && hasReturnType(content)

  score += hasEfficientDataFlow ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasDirectAccess ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasNoRedundantPaths ? 5 : 0

  const quality = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const redundantPathCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoIndirection = !has(/\beval\b/, content)
  const hasNoRecalculating = !has(/\bdebugger\b/, content)
  const hasNoUnoptimized = redundantPathCount === 0
  const hasHighQuality = quality >= 70

  let conductivity: ConductivityGrade
  if (quality >= 85) conductivity = 'superconductor'
  else if (quality >= 70) conductivity = 'high-conductivity'
  else if (quality >= 55) conductivity = 'proper-flow'
  else if (quality >= 40) conductivity = 'resistive-wire'
  else if (quality >= 25) conductivity = 'insulated'
  else conductivity = 'no-conductivity'

  return {
    quality, conductivity, hasHighQuality, hasEfficientDataFlow, hasNoBottlenecks,
    hasStreamlined, hasNoRedundantPaths, hasDirectAccess, hasNoIndirection,
    hasCached, hasNoRecalculating, hasOptimized, hasNoUnoptimized,
    bottleneckCount, redundantPathCount,
  }
}

/**
 * Measure alloy strength (alloying)
 * @example
 * const m = measureAlloying(content)
 * console.log(m.alloy) // 'bronze-masterpiece'
 */
export function measureAlloying(content: string): AlloyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0

  const hasWellIntegrated = hasExport(content) && hasImport(content)
  const hasCleanInterfaces = hasInterface(content) && hasReturnType(content)
  const hasModular = hasNamedExport(content) && hasExport(content)
  const hasCompatible = hasGenerics(content) && hasInterface(content)
  const hasTested = hasTryCatch(content) && hasReturnType(content)
  const hasCohesive = hasClass(content) && hasPrivate(content)

  score += hasWellIntegrated ? 5 : 0
  score += hasCleanInterfaces ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasCompatible ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasCohesive ? 5 : 0

  const strength = Math.min(score, 100)
  const leakyAbstractionCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoLeakyAbstractions = leakyAbstractionCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoVersionConflicts = !has(/\beval\b/, content)
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let alloy: AlloyGrade
  if (strength >= 85) alloy = 'bronze-masterpiece'
  else if (strength >= 70) alloy = 'strong-alloy'
  else if (strength >= 55) alloy = 'proper-mix'
  else if (strength >= 40) alloy = 'weak-bond'
  else if (strength >= 25) alloy = 'brittle-composite'
  else alloy = 'no-alloy'

  return {
    strength, alloy, hasHighStrength, hasWellIntegrated, hasCleanInterfaces,
    hasNoLeakyAbstractions, hasModular, hasNoMonolithic, hasCompatible,
    hasNoVersionConflicts, hasTested, hasNoUntested, hasCohesive,
    leakyAbstractionCount, monolithicCount,
  }
}

/**
 * Measure verdigris beauty (beautifying)
 * @example
 * const m = measureBeautifying(content)
 * console.log(m.verdigris) // 'stunning-patina'
 */
export function measureBeautifying(content: string): BeautifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasElegant = hasDocComments(content) && hasReturnType(content)
  const hasReadable = hasConst(content) && hasStrictEq(content)
  const hasWellNamed = hasNamedExport(content) && hasDocComments(content)
  const hasConsistent = hasExport(content) && hasImport(content)
  const hasFormatted = hasReadonly(content) && hasConst(content)
  const hasGraceful = hasOptional(content) && hasStrictEq(content)

  score += hasElegant ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasFormatted ? 5 : 0
  score += hasGraceful ? 5 : 0

  const beauty = Math.min(score, 100)
  const uglyCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoUgly = uglyCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoInconsistent = !has(/\beval\b/, content)
  const hasNoMessy = !has(/\bdebugger\b/, content)
  const hasHighBeauty = beauty >= 70

  let verdigris: VerdigrisGrade
  if (beauty >= 85) verdigris = 'stunning-patina'
  else if (beauty >= 70) verdigris = 'beautiful-green'
  else if (beauty >= 55) verdigris = 'proper-color'
  else if (beauty >= 40) verdigris = 'patchy-surface'
  else if (beauty >= 25) verdigris = 'tarnished-metal'
  else verdigris = 'no-beauty'

  return {
    beauty, verdigris, hasHighBeauty, hasElegant, hasReadable, hasNoUgly,
    hasWellNamed, hasNoCryptic, hasConsistent, hasNoInconsistent, hasFormatted,
    hasNoMessy, hasGraceful, uglyCount, crypticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify patina condition
 * @example
 * classifyPatinaCondition(90) // 'statue-of-liberty'
 */
export function classifyPatinaCondition(score: number): PatinaCondition {
  if (score >= 85) return 'statue-of-liberty'
  if (score >= 70) return 'aged-masterpiece'
  if (score >= 55) return 'proper-copper'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 25) return 'raw-wire'
  return 'scrap'
}

/**
 * Classify forge type
 * @example
 * classifyForgeType(patinas) // 'grand-foundry'
 */
export function classifyForgeType(patinas: CopperPatina[]): ForgeType {
  if (patinas.length === 0) return 'no-forge'
  const avgQs = Math.round(patinas.reduce((s, p) => s + p.qualityScore, 0) / patinas.length)
  const statueRatio = patinas.filter(p => p.condition === 'statue-of-liberty').length / patinas.length
  if (avgQs >= 75 && statueRatio >= 0.5) return 'grand-foundry'
  if (avgQs >= 60) return 'proper-forge'
  if (avgQs >= 45) return 'decent-workshop'
  if (avgQs >= 30) return 'small-anvil'
  if (avgQs >= 15) return 'cold-hearth'
  return 'no-forge'
}

/**
 * Classify forge condition
 * @example
 * classifyForgeCondition(80) // 'masterwork-forge'
 */
export function classifyForgeCondition(avgQs: number): ForgeCondition {
  if (avgQs >= 75) return 'masterwork-forge'
  if (avgQs >= 60) return 'quality-foundry'
  if (avgQs >= 45) return 'decent-workshop'
  if (avgQs >= 30) return 'rusty-shed'
  if (avgQs >= 15) return 'abandoned'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'master-smith'
 */
export function classifySmithGrade(avgCraftsmanship: number): SmithGrade {
  if (avgCraftsmanship >= 80) return 'master-smith'
  if (avgCraftsmanship >= 65) return 'expert-forge'
  if (avgCraftsmanship >= 50) return 'skilled-craftsman'
  if (avgCraftsmanship >= 35) return 'apprentice'
  if (avgCraftsmanship >= 20) return 'novice'
  return 'scrap-dealer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(patinas, forges, foundry, stats)
 */
export function generateRecommendations(
  patinas: CopperPatina[],
  forges: CopperForge[],
  foundry: FoundrySummary,
  stats: CopperBloomStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Age your code with patina wisdom — iterate, refactor, and polish through documented iterations')
  }
  if (stats.avgOxidationResilience < 50) {
    recs.push('Build oxidation resilience with error handling, input validation, and defensive coding')
  }
  if (stats.avgConductivityQuality < 50) {
    recs.push('Improve conductivity quality with streamlined data flow, direct access patterns, and caching')
  }
  if (stats.avgAlloyStrength < 50) {
    recs.push('Strengthen alloy bonds with clean interfaces, modular exports, and cohesive class design')
  }
  if (stats.avgVerdigrisBeauty < 50) {
    recs.push('Grow verdigris beauty with elegant naming, consistent formatting, and graceful patterns')
  }
  if (stats.scrapCount > 0) {
    recs.push(`${stats.scrapCount} file(s) are scrap — they need copper restoration`)
  }
  if (foundry.overallCraftsmanship < 40) {
    recs.push('Overall craftsmanship is low — focus on patina wisdom and oxidation resilience first')
  }
  const allCold = forges.every(f => f.forgeType === 'no-forge' || f.forgeType === 'cold-hearth')
  if (allCold && forges.length > 0) {
    recs.push('All forges are cold — consider a major metallurgical redesign')
  }
  const scrapFiles = patinas.filter(p => p.condition === 'scrap').map(p => p.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Restore these scrap files into copper masterpieces: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your copper bloom achieves master smith craftsmanship! Every patina shines with ancient wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as copper patina
 * @example
 * const p = analyzeCopperPatina(content, 'index.ts')
 * console.log(p.condition) // 'statue-of-liberty'
 */
export function analyzeCopperPatina(content: string, filePath: string): CopperPatina {
  const aging = measureAging(content)
  const resisting = measureResisting(content)
  const conducting = measureConducting(content)
  const alloying = measureAlloying(content)
  const beautifying = measureBeautifying(content)

  const qualityScore = Math.round(
    aging.wisdom * 0.2 +
    resisting.resilience * 0.2 +
    conducting.quality * 0.2 +
    alloying.strength * 0.2 +
    beautifying.beauty * 0.2,
  )

  return {
    file: filePath,
    patinaWisdom: aging.wisdom,
    oxidationResilience: resisting.resilience,
    conductivityQuality: conducting.quality,
    alloyStrength: alloying.strength,
    verdigrisBeauty: beautifying.beauty,
    aging,
    resisting,
    conducting,
    alloying,
    beautifying,
    condition: classifyPatinaCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as copper forge
 * @example
 * const f = analyzeCopperForge(patinas, 'src')
 * console.log(f.forgeType) // 'grand-foundry'
 */
export function analyzeCopperForge(patinas: CopperPatina[], dirPath: string): CopperForge {
  if (patinas.length === 0) {
    return {
      directory: dirPath, patinas: [], avgWisdom: 0, avgConductivity: 0,
      avgStrength: 0, statueOfLibertyCount: 0, scrapCount: 0,
      forgeType: 'no-forge', condition: 'void',
    }
  }

  const avgWisdom = Math.round(patinas.reduce((s, p) => s + p.patinaWisdom, 0) / patinas.length)
  const avgConductivity = Math.round(patinas.reduce((s, p) => s + p.conductivityQuality, 0) / patinas.length)
  const avgStrength = Math.round(patinas.reduce((s, p) => s + p.alloyStrength, 0) / patinas.length)
  const statueOfLibertyCount = patinas.filter(p => p.condition === 'statue-of-liberty').length
  const scrapCount = patinas.filter(p => p.condition === 'scrap').length
  const avgQs = Math.round(patinas.reduce((s, p) => s + p.qualityScore, 0) / patinas.length)

  return {
    directory: dirPath, patinas, avgWisdom, avgConductivity, avgStrength,
    statueOfLibertyCount, scrapCount, forgeType: classifyForgeType(patinas),
    condition: classifyForgeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete copper bloom result
 * @example
 * const result = await buildCopperBloomResult(files, contents)
 * console.log(result.stats.smithGrade) // 'master-smith'
 */
export async function buildCopperBloomResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperBloomResult> {
  const patinas = files.map((file, i) => analyzeCopperPatina(contents[i] ?? '', file))

  const dirMap = new Map<string, CopperPatina[]>()
  for (const patina of patinas) {
    const dir = path.dirname(patina.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(patina) } else { dirMap.set(dir, [patina]) }
  }

  const forges = Array.from(dirMap.entries()).map(([dir, dirPatinas]) =>
    analyzeCopperForge(dirPatinas, dir),
  )

  const avgWisdom = patinas.length > 0
    ? Math.round(patinas.reduce((s, p) => s + p.patinaWisdom, 0) / patinas.length) : 0
  const avgConductivity = patinas.length > 0
    ? Math.round(patinas.reduce((s, p) => s + p.conductivityQuality, 0) / patinas.length) : 0
  const avgStrength = patinas.length > 0
    ? Math.round(patinas.reduce((s, p) => s + p.alloyStrength, 0) / patinas.length) : 0

  const overallCraftsmanship = patinas.length > 0
    ? Math.round((avgWisdom + avgConductivity + avgStrength) / 3) : 0
  const isMasterwork = avgWisdom >= 60

  const foundry: FoundrySummary = { avgWisdom, avgConductivity, avgStrength, isMasterwork, overallCraftsmanship }

  const avgOxidationResilience = patinas.length > 0
    ? Math.round(patinas.reduce((s, p) => s + p.oxidationResilience, 0) / patinas.length) : 0
  const avgVerdigrisBeauty = patinas.length > 0
    ? Math.round(patinas.reduce((s, p) => s + p.verdigrisBeauty, 0) / patinas.length) : 0

  const bestPatina = patinas.length > 0
    ? patinas.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const wisest = patinas.length > 0
    ? patinas.reduce((best, p) => p.patinaWisdom > best.patinaWisdom ? p : best).file : ''
  const mostResilient = patinas.length > 0
    ? patinas.reduce((best, p) => p.oxidationResilience > best.oxidationResilience ? p : best).file : ''
  const bestConductor = patinas.length > 0
    ? patinas.reduce((best, p) => p.conductivityQuality > best.conductivityQuality ? p : best).file : ''
  const strongest = patinas.length > 0
    ? patinas.reduce((best, p) => p.alloyStrength > best.alloyStrength ? p : best).file : ''

  const stats: CopperBloomStats = {
    totalFiles: patinas.length,
    totalForges: forges.length,
    avgPatinaWisdom: avgWisdom,
    avgOxidationResilience,
    avgConductivityQuality: avgConductivity,
    avgAlloyStrength: avgStrength,
    avgVerdigrisBeauty,
    statueOfLibertyCount: patinas.filter(p => p.condition === 'statue-of-liberty').length,
    agedMasterpieceCount: patinas.filter(p => p.condition === 'aged-masterpiece').length,
    properCopperCount: patinas.filter(p => p.condition === 'proper-copper').length,
    tarnishedMetalCount: patinas.filter(p => p.condition === 'tarnished-metal').length,
    rawWireCount: patinas.filter(p => p.condition === 'raw-wire').length,
    scrapCount: patinas.filter(p => p.condition === 'scrap').length,
    hasHighWisdomCount: patinas.filter(p => p.aging.hasHighWisdom).length,
    hasHighResilienceCount: patinas.filter(p => p.resisting.hasHighResilience).length,
    hasHighQualityCount: patinas.filter(p => p.conducting.hasHighQuality).length,
    hasHighStrengthCount: patinas.filter(p => p.alloying.hasHighStrength).length,
    hasHighBeautyCount: patinas.filter(p => p.beautifying.hasHighBeauty).length,
    overallCraftsmanship,
    smithGrade: classifySmithGrade(overallCraftsmanship),
    bestPatina, wisest, mostResilient, bestConductor, strongest,
  }

  const recommendations = generateRecommendations(patinas, forges, foundry, stats)

  return { patinas, forges, foundry, stats, recommendations }
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
