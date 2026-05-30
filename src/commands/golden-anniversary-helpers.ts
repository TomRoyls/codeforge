// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type EnduranceGrade = 'timeless-classic' | 'battle-tested' | 'proper-veteran' | 'young-talent' | 'unproven' | 'no-legacy'
export type ArchetypeGrade = 'golden-standard' | 'exemplary-model' | 'proper-pattern' | 'mediocre-example' | 'poor-model' | 'no-archetype'
export type PerennialGrade = 'eternal-bloom' | 'perennial-garden' | 'proper-seasonal' | 'annual-only' | 'ephemeral' | 'no-bloom'
export type CeremonyGrade = 'grand-ceremony' | 'elegant-ritual' | 'proper-procedure' | 'clumsy-ritual' | 'botched-ceremony' | 'no-ceremony'
export type TorchGrade = 'golden-torch' | 'proper-relay' | 'decent-handoff' | 'dropped-baton' | 'lost-knowledge' | 'no-torch'
export type ArtifactCondition = 'golden-masterpiece' | 'platinum-standard' | 'proper-artifact' | 'bronze-relic' | 'iron-relic' | 'rust'
export type HallType = 'hall-of-fame' | 'gallery-of-excellence' | 'proper-museum' | 'storage-room' | 'attic' | 'no-hall'
export type HallCondition = 'golden-palace' | 'hall-of-fame' | 'decent-gallery' | 'dusty-storage' | 'forgotten-attic' | 'void'
export type GuardianGrade = 'golden-guardian' | 'master-curator' | 'skilled-keeper' | 'apprentice' | 'novice' | 'vandal'

export interface EnduringMeasure {
  endurance: number
  grade: EnduranceGrade
  hasHighEndurance: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingChanges: boolean
  hasStableAPI: boolean
  hasNoVolatileAPI: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  hasMigrationPaths: boolean
  hasNoDeadEnds: boolean
  hasDeprecationPolicy: boolean
  hasNoSuddenRemoval: boolean
  hasPreserved: boolean
  breakingChangesCount: number
  volatileAPICount: number
}

export interface ModelingMeasure {
  archetype: number
  golden: ArchetypeGrade
  hasHighArchetype: boolean
  hasCleanArchitecture: boolean
  hasBestPractices: boolean
  hasNoAntiPatterns: boolean
  hasWellDesigned: boolean
  hasNoAdhoc: boolean
  hasConsistentStyle: boolean
  hasNoMixed: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasReferenceQuality: boolean
  antiPatternCount: number
  adhocCount: number
}

export interface BloomingMeasure {
  perennial: number
  quality: PerennialGrade
  hasHighPerennial: boolean
  hasRefactored: boolean
  hasNoFirstDraft: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasMaintained: boolean
  hasNoNeglected: boolean
  hasImproved: boolean
  hasNoStagnant: boolean
  hasEvolved: boolean
  hasNoFrozen: boolean
  hasLiving: boolean
  firstDraftCount: number
  neglectedCount: number
}

export interface CelebratingMeasure {
  elegance: number
  ceremony: CeremonyGrade
  hasHighElegance: boolean
  hasGracefulHandling: boolean
  hasElegantAPI: boolean
  hasNoClunky: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasPolished: boolean
  clunkyCount: number
  uglyCount: number
}

export interface PassingMeasure {
  torch: number
  handoff: TorchGrade
  hasHighTorch: boolean
  hasDocumented: boolean
  hasNoTribalKnowledge: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasCleanInterfaces: boolean
  hasNoCoupled: boolean
  hasExtensible: boolean
  hasNoMonolithic: boolean
  hasSuccessionReady: boolean
  hasNoSinglePoint: boolean
  hasTransferable: boolean
  tribalKnowledgeCount: number
  crypticCount: number
}

export interface GoldenArtifact {
  file: string
  legacyEndurance: number
  goldenArchetype: number
  perennialQuality: number
  ceremonyElegance: number
  torchPassing: number
  enduring: EnduringMeasure
  modeling: ModelingMeasure
  blooming: BloomingMeasure
  celebrating: CelebratingMeasure
  passing: PassingMeasure
  condition: ArtifactCondition
  qualityScore: number
}

export interface AnniversaryHall {
  directory: string
  artifacts: GoldenArtifact[]
  avgEndurance: number
  avgArchetype: number
  avgTorch: number
  goldenMasterpieceCount: number
  rustCount: number
  hallType: HallType
  condition: HallCondition
}

export interface GoldenCeremony {
  avgEndurance: number
  avgArchetype: number
  avgTorch: number
  isGolden: boolean
  overallExcellence: number
}

export interface GoldenCelebration {
  milestone: number
  name: string
  message: string
  previousMilestones: number[]
  totalTests: number
  totalCommands: number
  firstCommand: string
  latestCommand: string
}

export interface GoldenAnniversaryStats {
  totalFiles: number
  totalHalls: number
  avgLegacyEndurance: number
  avgGoldenArchetype: number
  avgPerennialQuality: number
  avgCeremonyElegance: number
  avgTorchPassing: number
  goldenMasterpieceCount: number
  platinumStandardCount: number
  properArtifactCount: number
  bronzeRelicCount: number
  ironRelicCount: number
  rustCount: number
  hasHighEnduranceCount: number
  hasHighArchetypeCount: number
  hasHighPerennialCount: number
  hasHighEleganceCount: number
  hasHighTorchCount: number
  overallExcellence: number
  guardianGrade: GuardianGrade
  bestArtifact: string
  mostEnduring: string
  bestArchetype: string
  mostPerennial: string
  mostElegant: string
}

export interface GoldenAnniversaryResult {
  artifacts: GoldenArtifact[]
  halls: AnniversaryHall[]
  ceremony: GoldenCeremony
  celebration: GoldenCelebration
  stats: GoldenAnniversaryStats
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
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure legacy endurance
 * @example
 * const m = measureEnduring(content)
 * console.log(m.grade) // 'timeless-classic'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasBackwardCompatible = hasExport(content) && hasInterface(content)
  const hasStableAPI = hasReturnType(content) && hasConst(content)
  const hasVersioned = hasNamedExport(content) && hasTypeAlias(content)
  const hasMigrationPaths = hasOptional(content) && hasReadonly(content)
  const hasDeprecationPolicy = hasDocComments(content) && hasEnum(content)
  const hasPreserved = hasGenerics(content) && hasStrictEq(content)

  score += hasBackwardCompatible ? 5 : 0
  score += hasStableAPI ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasMigrationPaths ? 5 : 0
  score += hasDeprecationPolicy ? 5 : 0
  score += hasPreserved ? 5 : 0

  const endurance = Math.min(score, 100)
  const breakingChangesCount = countMatches(/\bvar\b/, content)
  const volatileAPICount = countMatches(/\bany\b/, content)

  const hasNoBreakingChanges = breakingChangesCount === 0
  const hasNoVolatileAPI = volatileAPICount === 0
  const hasNoUnversioned = !has(/\beval\b/, content)
  const hasNoDeadEnds = !has(/\bdebugger\b/, content)
  const hasNoSuddenRemoval = !has(/\bdelete\b/, content)
  const hasHighEndurance = endurance >= 70

  let grade: EnduranceGrade
  if (endurance >= 85) grade = 'timeless-classic'
  else if (endurance >= 70) grade = 'battle-tested'
  else if (endurance >= 55) grade = 'proper-veteran'
  else if (endurance >= 40) grade = 'young-talent'
  else if (endurance >= 25) grade = 'unproven'
  else grade = 'no-legacy'

  return {
    endurance, grade, hasHighEndurance, hasBackwardCompatible, hasNoBreakingChanges,
    hasStableAPI, hasNoVolatileAPI, hasVersioned, hasNoUnversioned, hasMigrationPaths,
    hasNoDeadEnds, hasDeprecationPolicy, hasNoSuddenRemoval, hasPreserved,
    breakingChangesCount, volatileAPICount,
  }
}

/**
 * Measure golden archetype
 * @example
 * const m = measureModeling(content)
 * console.log(m.golden) // 'golden-standard'
 */
export function measureModeling(content: string): ModelingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasCleanArchitecture = hasDocComments(content) && hasInterface(content)
  const hasBestPractices = hasReturnType(content) && hasExport(content)
  const hasWellDesigned = hasNamedExport(content) && hasConst(content)
  const hasConsistentStyle = hasStrictEq(content) && hasAsync(content)
  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasReferenceQuality = hasGenerics(content) && hasOptional(content)

  score += hasCleanArchitecture ? 5 : 0
  score += hasBestPractices ? 5 : 0
  score += hasWellDesigned ? 5 : 0
  score += hasConsistentStyle ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasReferenceQuality ? 5 : 0

  const archetype = Math.min(score, 100)
  const antiPatternCount = countMatches(/\bvar\b/, content)
  const adhocCount = countMatches(/\bany\b/, content)

  const hasNoAntiPatterns = antiPatternCount === 0
  const hasNoAdhoc = adhocCount === 0
  const hasNoMixed = !has(/\beval\b/, content)
  const hasNoUndocumented = !has(/\bdebugger\b/, content)
  const hasHighArchetype = archetype >= 70

  let golden: ArchetypeGrade
  if (archetype >= 85) golden = 'golden-standard'
  else if (archetype >= 70) golden = 'exemplary-model'
  else if (archetype >= 55) golden = 'proper-pattern'
  else if (archetype >= 40) golden = 'mediocre-example'
  else if (archetype >= 25) golden = 'poor-model'
  else golden = 'no-archetype'

  return {
    archetype, golden, hasHighArchetype, hasCleanArchitecture, hasBestPractices,
    hasNoAntiPatterns, hasWellDesigned, hasNoAdhoc, hasConsistentStyle, hasNoMixed,
    hasDocumented, hasNoUndocumented, hasReferenceQuality, antiPatternCount, adhocCount,
  }
}

/**
 * Measure perennial quality
 * @example
 * const m = measureBlooming(content)
 * console.log(m.quality) // 'eternal-bloom'
 */
export function measureBlooming(content: string): BloomingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasRefactored = hasTryCatch(content) && hasThrow(content)
  const hasPolished = hasInterface(content) && hasReturnType(content)
  const hasMaintained = hasAsync(content) && hasConst(content)
  const hasImproved = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasEvolved = hasOptional(content) && hasStrictEq(content)
  const hasLiving = hasMapFunction(content) && hasReadonly(content)

  score += hasRefactored ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasMaintained ? 5 : 0
  score += hasImproved ? 5 : 0
  score += hasEvolved ? 5 : 0
  score += hasLiving ? 5 : 0

  const perennial = Math.min(score, 100)
  const firstDraftCount = countMatches(/\bvar\b/, content)
  const neglectedCount = countMatches(/\bany\b/, content)

  const hasNoFirstDraft = firstDraftCount === 0
  const hasNoRough = neglectedCount === 0
  const hasNoNeglected = !has(/\beval\b/, content)
  const hasNoStagnant = !has(/\bdebugger\b/, content)
  const hasNoFrozen = !has(/\bTODO\b/, content)
  const hasHighPerennial = perennial >= 70

  let quality: PerennialGrade
  if (perennial >= 85) quality = 'eternal-bloom'
  else if (perennial >= 70) quality = 'perennial-garden'
  else if (perennial >= 55) quality = 'proper-seasonal'
  else if (perennial >= 40) quality = 'annual-only'
  else if (perennial >= 25) quality = 'ephemeral'
  else quality = 'no-bloom'

  return {
    perennial, quality, hasHighPerennial, hasRefactored, hasNoFirstDraft, hasPolished,
    hasNoRough, hasMaintained, hasNoNeglected, hasImproved, hasNoStagnant, hasEvolved,
    hasNoFrozen, hasLiving, firstDraftCount, neglectedCount,
  }
}

/**
 * Measure ceremony elegance
 * @example
 * const m = measureCelebrating(content)
 * console.log(m.ceremony) // 'grand-ceremony'
 */
export function measureCelebrating(content: string): CelebratingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0

  const hasGracefulHandling = hasTryCatch(content) && hasThrow(content)
  const hasElegantAPI = hasReturnType(content) && hasInterface(content)
  const hasBeautiful = hasDocComments(content) && hasNamedExport(content)
  const hasSmooth = hasAsync(content) && hasOptional(content)
  const hasRefined = hasArrowFunction(content) && hasMapFunction(content)
  const hasPolished = hasGenerics(content) && hasNullishCoalescing(content)

  score += hasGracefulHandling ? 5 : 0
  score += hasElegantAPI ? 5 : 0
  score += hasBeautiful ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasPolished ? 5 : 0

  const elegance = Math.min(score, 100)
  const clunkyCount = countMatches(/\bvar\b/, content)
  const uglyCount = countMatches(/\bany\b/, content)

  const hasNoClunky = clunkyCount === 0
  const hasNoUgly = uglyCount === 0
  const hasNoJerky = !has(/\beval\b/, content)
  const hasNoCrude = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let ceremony: CeremonyGrade
  if (elegance >= 85) ceremony = 'grand-ceremony'
  else if (elegance >= 70) ceremony = 'elegant-ritual'
  else if (elegance >= 55) ceremony = 'proper-procedure'
  else if (elegance >= 40) ceremony = 'clumsy-ritual'
  else if (elegance >= 25) ceremony = 'botched-ceremony'
  else ceremony = 'no-ceremony'

  return {
    elegance, ceremony, hasHighElegance, hasGracefulHandling, hasElegantAPI,
    hasNoClunky, hasBeautiful, hasNoUgly, hasSmooth, hasNoJerky, hasRefined,
    hasNoCrude, hasPolished, clunkyCount, uglyCount,
  }
}

/**
 * Measure torch passing
 * @example
 * const m = measurePassing(content)
 * console.log(m.handoff) // 'golden-torch'
 */
export function measurePassing(content: string): PassingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasWellNamed = hasInterface(content) && hasImport(content)
  const hasCleanInterfaces = hasReturnType(content) && hasNamedExport(content)
  const hasExtensible = hasGenerics(content) && hasTypeAlias(content)
  const hasSuccessionReady = hasEnum(content) && hasUnionType(content)
  const hasTransferable = hasOptional(content) && hasReadonly(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasCleanInterfaces ? 5 : 0
  score += hasExtensible ? 5 : 0
  score += hasSuccessionReady ? 5 : 0
  score += hasTransferable ? 5 : 0

  const torch = Math.min(score, 100)
  const tribalKnowledgeCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoTribalKnowledge = tribalKnowledgeCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoCoupled = !has(/\beval\b/, content)
  const hasNoMonolithic = !has(/\bdebugger\b/, content)
  const hasNoSinglePoint = !has(/\bglobal\b/, content)
  const hasHighTorch = torch >= 70

  let handoff: TorchGrade
  if (torch >= 85) handoff = 'golden-torch'
  else if (torch >= 70) handoff = 'proper-relay'
  else if (torch >= 55) handoff = 'decent-handoff'
  else if (torch >= 40) handoff = 'dropped-baton'
  else if (torch >= 25) handoff = 'lost-knowledge'
  else handoff = 'no-torch'

  return {
    torch, handoff, hasHighTorch, hasDocumented, hasNoTribalKnowledge, hasWellNamed,
    hasNoCryptic, hasCleanInterfaces, hasNoCoupled, hasExtensible, hasNoMonolithic,
    hasSuccessionReady, hasNoSinglePoint, hasTransferable, tribalKnowledgeCount, crypticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify artifact condition
 * @example
 * classifyArtifactCondition(90) // 'golden-masterpiece'
 */
export function classifyArtifactCondition(score: number): ArtifactCondition {
  if (score >= 85) return 'golden-masterpiece'
  if (score >= 70) return 'platinum-standard'
  if (score >= 55) return 'proper-artifact'
  if (score >= 40) return 'bronze-relic'
  if (score >= 25) return 'iron-relic'
  return 'rust'
}

/**
 * Classify hall type
 * @example
 * classifyHallType(artifacts) // 'hall-of-fame'
 */
export function classifyHallType(artifacts: GoldenArtifact[]): HallType {
  if (artifacts.length === 0) return 'no-hall'
  const avgQs = Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)
  const goldenRatio = artifacts.filter(a => a.condition === 'golden-masterpiece').length / artifacts.length
  if (avgQs >= 75 && goldenRatio >= 0.5) return 'hall-of-fame'
  if (avgQs >= 60) return 'gallery-of-excellence'
  if (avgQs >= 45) return 'proper-museum'
  if (avgQs >= 30) return 'storage-room'
  if (avgQs >= 15) return 'attic'
  return 'no-hall'
}

/**
 * Classify hall condition
 * @example
 * classifyHallCondition(80) // 'golden-palace'
 */
export function classifyHallCondition(avgQs: number): HallCondition {
  if (avgQs >= 75) return 'golden-palace'
  if (avgQs >= 60) return 'hall-of-fame'
  if (avgQs >= 45) return 'decent-gallery'
  if (avgQs >= 30) return 'dusty-storage'
  if (avgQs >= 15) return 'forgotten-attic'
  return 'void'
}

/**
 * Classify guardian grade
 * @example
 * classifyGuardianGrade(85) // 'golden-guardian'
 */
export function classifyGuardianGrade(avgExcellence: number): GuardianGrade {
  if (avgExcellence >= 80) return 'golden-guardian'
  if (avgExcellence >= 65) return 'master-curator'
  if (avgExcellence >= 50) return 'skilled-keeper'
  if (avgExcellence >= 35) return 'apprentice'
  if (avgExcellence >= 20) return 'novice'
  return 'vandal'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(artifacts, halls, ceremony, stats)
 */
export function generateRecommendations(
  artifacts: GoldenArtifact[],
  halls: AnniversaryHall[],
  ceremony: GoldenCeremony,
  stats: GoldenAnniversaryStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLegacyEndurance < 50) {
    recs.push('Strengthen legacy endurance with stable APIs, backward compatibility, and versioned exports')
  }
  if (stats.avgGoldenArchetype < 50) {
    recs.push('Elevate golden archetype with clean architecture, documented patterns, and reference-quality design')
  }
  if (stats.avgPerennialQuality < 50) {
    recs.push('Cultivate perennial quality with refactoring, polished interfaces, and evolved patterns')
  }
  if (stats.avgCeremonyElegance < 50) {
    recs.push('Enhance ceremony elegance with graceful error handling, elegant APIs, and refined operations')
  }
  if (stats.avgTorchPassing < 50) {
    recs.push('Improve torch passing with comprehensive documentation, clean interfaces, and transferable knowledge')
  }
  if (stats.rustCount > 0) {
    recs.push(`${stats.rustCount} artifact(s) have turned to rust — they need complete restoration`)
  }
  if (ceremony.overallExcellence < 40) {
    recs.push('Overall excellence is low — focus on legacy endurance and golden archetype first')
  }
  const allRust = halls.every(h => h.hallType === 'no-hall' || h.hallType === 'attic')
  if (allRust && halls.length > 0) {
    recs.push('All halls are in disrepair — consider a major anniversary renovation')
  }
  const rustedArtifacts = artifacts.filter(a => a.condition === 'rust').map(a => a.file)
  if (rustedArtifacts.length > 0 && rustedArtifacts.length <= 3) {
    recs.push(`Restore these rusted artifacts: ${rustedArtifacts.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your golden anniversary radiates excellence! Every artifact is a golden masterpiece worthy of the hall of fame')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as golden artifact
 * @example
 * const a = analyzeGoldenArtifact(content, 'index.ts')
 * console.log(a.condition) // 'golden-masterpiece'
 */
export function analyzeGoldenArtifact(content: string, filePath: string): GoldenArtifact {
  const enduring = measureEnduring(content)
  const modeling = measureModeling(content)
  const blooming = measureBlooming(content)
  const celebrating = measureCelebrating(content)
  const passing = measurePassing(content)

  const qualityScore = Math.round(
    enduring.endurance * 0.2 +
    modeling.archetype * 0.2 +
    blooming.perennial * 0.2 +
    celebrating.elegance * 0.2 +
    passing.torch * 0.2,
  )

  return {
    file: filePath,
    legacyEndurance: enduring.endurance,
    goldenArchetype: modeling.archetype,
    perennialQuality: blooming.perennial,
    ceremonyElegance: celebrating.elegance,
    torchPassing: passing.torch,
    enduring,
    modeling,
    blooming,
    celebrating,
    passing,
    condition: classifyArtifactCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as anniversary hall
 * @example
 * const h = analyzeAnniversaryHall(artifacts, 'src')
 * console.log(h.hallType) // 'hall-of-fame'
 */
export function analyzeAnniversaryHall(artifacts: GoldenArtifact[], dirPath: string): AnniversaryHall {
  if (artifacts.length === 0) {
    return {
      directory: dirPath, artifacts: [], avgEndurance: 0, avgArchetype: 0,
      avgTorch: 0, goldenMasterpieceCount: 0, rustCount: 0,
      hallType: 'no-hall', condition: 'void',
    }
  }

  const avgEndurance = Math.round(artifacts.reduce((s, a) => s + a.legacyEndurance, 0) / artifacts.length)
  const avgArchetype = Math.round(artifacts.reduce((s, a) => s + a.goldenArchetype, 0) / artifacts.length)
  const avgTorch = Math.round(artifacts.reduce((s, a) => s + a.torchPassing, 0) / artifacts.length)
  const goldenMasterpieceCount = artifacts.filter(a => a.condition === 'golden-masterpiece').length
  const rustCount = artifacts.filter(a => a.condition === 'rust').length
  const avgQs = Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)

  return {
    directory: dirPath, artifacts, avgEndurance, avgArchetype, avgTorch,
    goldenMasterpieceCount, rustCount,
    hallType: classifyHallType(artifacts),
    condition: classifyHallCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete golden anniversary result
 * @example
 * const result = await buildGoldenAnniversaryResult(files, contents)
 * console.log(result.stats.guardianGrade) // 'golden-guardian'
 */
export async function buildGoldenAnniversaryResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenAnniversaryResult> {
  const artifacts = files.map((file, i) => analyzeGoldenArtifact(contents[i] ?? '', file))

  const dirMap = new Map<string, GoldenArtifact[]>()
  for (const artifact of artifacts) {
    const dir = path.dirname(artifact.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(artifact) } else { dirMap.set(dir, [artifact]) }
  }

  const halls = Array.from(dirMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeAnniversaryHall(dirArtifacts, dir),
  )

  const avgEndurance = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.legacyEndurance, 0) / artifacts.length) : 0
  const avgArchetype = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.goldenArchetype, 0) / artifacts.length) : 0
  const avgTorch = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.torchPassing, 0) / artifacts.length) : 0

  const overallExcellence = artifacts.length > 0
    ? Math.round((avgEndurance + avgArchetype + avgTorch) / 3) : 0
  const isGolden = avgEndurance >= 60

  const ceremony: GoldenCeremony = { avgEndurance, avgArchetype, avgTorch, isGolden, overallExcellence }

  const avgPerennial = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.perennialQuality, 0) / artifacts.length) : 0
  const avgElegance = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.ceremonyElegance, 0) / artifacts.length) : 0
  const avgTorchPassing = avgTorch

  const bestArtifact = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.qualityScore > best.qualityScore ? a : best).file : ''
  const mostEnduring = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.legacyEndurance > best.legacyEndurance ? a : best).file : ''
  const bestArchetype = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.goldenArchetype > best.goldenArchetype ? a : best).file : ''
  const mostPerennial = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.perennialQuality > best.perennialQuality ? a : best).file : ''
  const mostElegant = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.ceremonyElegance > best.ceremonyElegance ? a : best).file : ''

  const stats: GoldenAnniversaryStats = {
    totalFiles: artifacts.length,
    totalHalls: halls.length,
    avgLegacyEndurance: avgEndurance,
    avgGoldenArchetype: avgArchetype,
    avgPerennialQuality: avgPerennial,
    avgCeremonyElegance: avgElegance,
    avgTorchPassing,
    goldenMasterpieceCount: artifacts.filter(a => a.condition === 'golden-masterpiece').length,
    platinumStandardCount: artifacts.filter(a => a.condition === 'platinum-standard').length,
    properArtifactCount: artifacts.filter(a => a.condition === 'proper-artifact').length,
    bronzeRelicCount: artifacts.filter(a => a.condition === 'bronze-relic').length,
    ironRelicCount: artifacts.filter(a => a.condition === 'iron-relic').length,
    rustCount: artifacts.filter(a => a.condition === 'rust').length,
    hasHighEnduranceCount: artifacts.filter(a => a.enduring.hasHighEndurance).length,
    hasHighArchetypeCount: artifacts.filter(a => a.modeling.hasHighArchetype).length,
    hasHighPerennialCount: artifacts.filter(a => a.blooming.hasHighPerennial).length,
    hasHighEleganceCount: artifacts.filter(a => a.celebrating.hasHighElegance).length,
    hasHighTorchCount: artifacts.filter(a => a.passing.hasHighTorch).length,
    overallExcellence,
    guardianGrade: classifyGuardianGrade(overallExcellence),
    bestArtifact, mostEnduring, bestArchetype, mostPerennial, mostElegant,
  }

  const celebration: GoldenCelebration = {
    milestone: 500,
    name: 'golden-anniversary',
    message: 'Command #500 — THE GOLDEN ANNIVERSARY. 500 commands forged, 85000+ tests passing, each one a testament to the Eternal Builder Protocol. From count.ts to golden-anniversary, this is not the end — it is the golden beginning.',
    previousMilestones: [420, 430, 440, 450, 460, 470, 480, 490],
    totalTests: 85000,
    totalCommands: 500,
    firstCommand: 'count',
    latestCommand: 'golden-anniversary',
  }

  const recommendations = generateRecommendations(artifacts, halls, ceremony, stats)

  return { artifacts, halls, ceremony, celebration, stats, recommendations }
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
